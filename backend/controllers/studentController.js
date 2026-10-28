import Student from '../models/Student.js';
import Van from '../models/Van.js';
import { createError } from '../utils/createError.js';

// ================= PARENT =================

// GET /api/students/my  (parent only)
// Returns ONLY the logged-in parent's children
export const getMyChildren = async (req, res) => {
  const children = await Student.find({ parent: req.user._id })
    .populate({
      path: 'van',
      select: 'vanNumber model driver route',
      populate: [
        { path: 'driver', select: 'fullName phone' },
        { path: 'route', select: 'name school' },
      ],
    })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, children });
};

// POST /api/students  (parent only)
// Parent adds a child = requests van service (status starts as "pending")
export const addChild = async (req, res) => {
  const { fullName, grade, school, pickupAddress, emergencyContact, notes } = req.body || {};

  const student = await Student.create({
    fullName,
    grade,
    school,
    pickupAddress,
    emergencyContact: {
      name: emergencyContact?.name,
      phone: emergencyContact?.phone,
    },
    notes,
    parent: req.user._id, // ALWAYS the logged-in parent - never from req.body
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Child added. The administrator will assign a van soon.',
    student,
  });
};

// ================= ADMIN =================

// GET /api/students  (admin only)
// Lists all students. Optional filter: /api/students?status=pending
export const getAllStudents = async (req, res) => {
  const filter = {};
  if (['pending', 'assigned', 'inactive'].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const students = await Student.find(filter)
    .populate('parent', 'fullName phone email')
    .populate('van', 'vanNumber capacity')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, students });
};

// PATCH /api/students/:id/assign  (admin only)
// Assigns a student to a van - with VAN CAPACITY CHECK
export const assignVan = async (req, res) => {
  const { vanId } = req.body || {};
  if (!vanId) {
    throw createError(400, 'Please choose a van');
  }

  const student = await Student.findById(req.params.id);
  if (!student) {
    throw createError(404, 'Student not found');
  }

  const van = await Van.findById(vanId);
  if (!van || !van.isActive) {
    throw createError(400, 'Please choose a valid, active van');
  }

  if (student.van && student.van.equals(van._id)) {
    throw createError(400, `${student.fullName} is already in van ${van.vanNumber}`);
  }

  // ===== Van capacity management =====
  const assignedCount = await Student.countDocuments({ van: van._id });
  if (assignedCount >= van.capacity) {
    throw createError(
      409,
      `Van ${van.vanNumber} is full (${assignedCount}/${van.capacity} seats). Choose another van.`
    );
  }

  student.van = van._id;
  student.status = 'assigned';
  await student.save();

  res.status(200).json({
    success: true,
    message: `${student.fullName} assigned to van ${van.vanNumber} (${assignedCount + 1}/${van.capacity} seats)`,
    student,
  });
};

// PATCH /api/students/:id/unassign  (admin only)
// Removes a student from their van
export const unassignVan = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    throw createError(404, 'Student not found');
  }

  student.van = null;
  student.status = 'pending';
  await student.save();

  res.status(200).json({
    success: true,
    message: `${student.fullName} removed from the van`,
    student,
  });
};