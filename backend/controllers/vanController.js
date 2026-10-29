import Van from '../models/Van.js';
import User from '../models/User.js';
import Route from '../models/Route.js';
import Student from '../models/Student.js';
import { createError } from '../utils/createError.js';

// Checks the chosen driver: must be an approved, active driver who does not drive another van
const checkDriver = async (driverId, currentVanId = null) => {
  if (!driverId) return null; // no driver chosen

  const driver = await User.findOne({
    _id: driverId,
    role: 'driver',
    isActive: true,
    isApproved: { $ne: false }, // not waiting for approval
  });
  if (!driver) {
    throw createError(400, 'Please choose a valid, approved and active driver');
  }

  const query = { driver: driverId };
  if (currentVanId) query._id = { $ne: currentVanId };
  const otherVan = await Van.findOne(query);
  if (otherVan) {
    throw createError(409, `This driver is already assigned to van ${otherVan.vanNumber}`);
  }

  return driver._id;
};

// Checks the chosen route exists
const checkRoute = async (routeId) => {
  if (!routeId) return null;

  const route = await Route.findById(routeId);
  if (!route) {
    throw createError(400, 'Please choose a valid route');
  }
  return route._id;
};

// GET /api/vans  (admin only)
export const getVans = async (req, res) => {
  const vans = await Van.find()
    .populate('driver', 'fullName phone')
    .populate('route', 'name school')
    .sort({ vanNumber: 1 });

  const counts = await Promise.all(
    vans.map((van) => Student.countDocuments({ van: van._id }))
  );

  res.status(200).json({
    success: true,
    vans: vans.map((van, index) => ({
      ...van.toJSON(),
      assignedCount: counts[index],
    })),
  });
};

// POST /api/vans  (admin only)
export const createVan = async (req, res) => {
  const { vanNumber, model, capacity, driver, route } = req.body || {};

  if (!vanNumber || !capacity) {
    throw createError(400, 'Van number and seating capacity are required');
  }

  const van = await Van.create({
    vanNumber,
    model,
    capacity,
    driver: await checkDriver(driver),
    route: await checkRoute(route),
  });

  res.status(201).json({ success: true, message: 'Van added', van });
};

// PUT /api/vans/:id  (admin only)
export const updateVan = async (req, res) => {
  const van = await Van.findById(req.params.id);
  if (!van) {
    throw createError(404, 'Van not found');
  }

  const { vanNumber, model, capacity, driver, route, isActive } = req.body || {};

  if (capacity !== undefined) {
    const assigned = await Student.countDocuments({ van: van._id });
    if (Number(capacity) < assigned) {
      throw createError(400, `This van already has ${assigned} students. Capacity cannot be less than that.`);
    }
    van.capacity = capacity;
  }

  if (vanNumber !== undefined) van.vanNumber = vanNumber;
  if (model !== undefined) van.model = model;
  if (driver !== undefined) van.driver = await checkDriver(driver, van._id);
  if (route !== undefined) van.route = await checkRoute(route);
  if (isActive !== undefined) van.isActive = Boolean(isActive);

  await van.save();

  res.status(200).json({ success: true, message: 'Van updated', van });
};

// DELETE /api/vans/:id  (admin only)
export const deleteVan = async (req, res) => {
  const van = await Van.findById(req.params.id);
  if (!van) {
    throw createError(404, 'Van not found');
  }

  const assigned = await Student.countDocuments({ van: van._id });
  if (assigned > 0) {
    throw createError(400, `Remove the ${assigned} assigned student(s) from this van first`);
  }

  await van.deleteOne();

  res.status(200).json({ success: true, message: 'Van deleted' });
};