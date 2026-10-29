import Trip from '../models/Trip.js';
import Van from '../models/Van.js';
import Student from '../models/Student.js';
import { createError } from '../utils/createError.js';

// Today's date in Sri Lanka time, e.g. "2026-10-29"
const todayString = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });

// Friendly names for each status
const statusLabels = {
  waiting: 'waiting',
  picked_up: 'picked up',
  at_school: 'at school',
  dropped_off: 'dropped off',
  absent: 'absent',
};

// Finds the van this driver drives
const getDriverVan = async (driverId) => {
  const van = await Van.findOne({ driver: driverId });
  if (!van) {
    throw createError(404, 'No van is assigned to you yet. Please contact the administrator.');
  }
  return van;
};

// Gets today's trip for a van, creating it the first time it is opened today
const getOrCreateTodayTrip = async (van, driverId) => {
  const date = todayString();
  const assigned = await Student.find({ van: van._id, status: 'assigned' }).select('_id');

  // "upsert" = create the trip only if it does not exist yet (safe if called twice at once)
  try {
    await Trip.updateOne(
      { van: van._id, date },
      {
        $setOnInsert: {
          driver: driverId,
          students: assigned.map((s) => ({ student: s._id })),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error; // another request created it first - that's fine
  }

  const trip = await Trip.findOne({ van: van._id, date });

  // Add any students the admin assigned AFTER the trip was created today
  const onTrip = new Set(trip.students.map((s) => s.student.toString()));
  const newStudents = assigned.filter((s) => !onTrip.has(s._id.toString()));
  if (newStudents.length > 0) {
    newStudents.forEach((s) => trip.students.push({ student: s._id }));
    await trip.save();
  }

  return trip;
};

// Finds today's trip for this driver's van (must already exist)
const getTodayTripForDriver = async (driverId) => {
  const van = await getDriverVan(driverId);
  const trip = await Trip.findOne({ van: van._id, date: todayString() });
  if (!trip) {
    throw createError(404, "Please open today's trip first");
  }
  return trip;
};

// ================= DRIVER =================

// GET /api/trips/today  (driver only)
// Returns the driver's van, route and today's student list
export const getDriverTodayTrip = async (req, res) => {
  const van = await Van.findOne({ driver: req.user._id }).populate('route');

  if (!van) {
    return res.status(200).json({ success: true, van: null, trip: null });
  }

  const trip = await getOrCreateTodayTrip(van, req.user._id);

  // Replace student IDs with student details (and their parent's name + phone)
  await trip.populate({
    path: 'students.student',
    select: 'fullName grade school pickupAddress notes emergencyContact parent',
    populate: { path: 'parent', select: 'fullName phone' },
  });

  res.status(200).json({ success: true, van, trip });
};

// PATCH /api/trips/today/students/:studentId  (driver only)
// Moves ONE student to the next step - steps must happen in the right order
export const updateStudentTripStatus = async (req, res) => {
  const { status } = req.body || {};

  // Which status a student must have BEFORE each new status
  const requiredBefore = {
    picked_up: 'waiting',
    at_school: 'picked_up',
    dropped_off: 'at_school',
    absent: 'waiting',
  };

  if (!requiredBefore[status]) {
    throw createError(400, 'Invalid status');
  }

  const trip = await getTodayTripForDriver(req.user._id);

  // The student must be on THIS driver's trip (drivers cannot touch other vans)
  const entry = trip.students.find((s) => s.student.toString() === req.params.studentId);
  if (!entry) {
    throw createError(404, 'This student is not on your trip today');
  }

  if (entry.status !== requiredBefore[status]) {
    throw createError(
      400,
      `Cannot mark as ${statusLabels[status]} - the student is currently ${statusLabels[entry.status]}`
    );
  }

  entry.status = status;

  // Save the time of each step
  const timeField = { picked_up: 'pickedUpAt', at_school: 'arrivedAt', dropped_off: 'droppedOffAt' }[status];
  if (timeField) entry[timeField] = new Date();

  await trip.save();

  res.status(200).json({ success: true, message: `Marked as ${statusLabels[status]}` });
};

// PATCH /api/trips/today/arrived  (driver only)
// Marks EVERY student on board as "at school" with one click
export const markAllArrived = async (req, res) => {
  const trip = await getTodayTripForDriver(req.user._id);

  const now = new Date();
  let count = 0;
  trip.students.forEach((entry) => {
    if (entry.status === 'picked_up') {
      entry.status = 'at_school';
      entry.arrivedAt = now;
      count += 1;
    }
  });

  if (count === 0) {
    throw createError(400, 'No students are on board right now');
  }

  await trip.save();

  res.status(200).json({ success: true, message: `${count} student(s) marked as arrived at school` });
};

// POST /api/trips/today/delay  (driver only)
// Reports a delay - parents of children in this van will see it
export const reportDelay = async (req, res) => {
  const { minutes, reason } = req.body || {};
  const mins = Number(minutes);

  if (!Number.isInteger(mins) || mins < 1 || mins > 180) {
    throw createError(400, 'Delay must be between 1 and 180 minutes');
  }
  if (!reason || String(reason).trim().length < 3) {
    throw createError(400, 'Please give a short reason for the delay');
  }

  const trip = await getTodayTripForDriver(req.user._id);
  trip.delay = { minutes: mins, reason, reportedAt: new Date() };
  await trip.save();

  res.status(200).json({ success: true, message: `Delay of ${mins} minutes reported. Parents can now see it.` });
};

// ================= PARENT =================

// GET /api/trips/my-children  (parent only)
// Today's journey status for ONLY this parent's children
export const getMyChildrenTripStatus = async (req, res) => {
  const children = await Student.find({ parent: req.user._id, van: { $ne: null } }).select('_id van');
  const childIds = new Set(children.map((c) => c._id.toString()));
  const vanIds = [...new Set(children.map((c) => c.van.toString()))];

  const trips = await Trip.find({ van: { $in: vanIds }, date: todayString() });

  // Build { studentId: { status, times, delay } } - only for this parent's children
  const statuses = {};
  trips.forEach((trip) => {
    trip.students.forEach((entry) => {
      const id = entry.student.toString();
      if (childIds.has(id)) {
        statuses[id] = {
          status: entry.status,
          pickedUpAt: entry.pickedUpAt,
          arrivedAt: entry.arrivedAt,
          droppedOffAt: entry.droppedOffAt,
          delay: trip.delay?.minutes ? trip.delay : null,
        };
      }
    });
  });

  res.status(200).json({ success: true, date: todayString(), statuses });
};