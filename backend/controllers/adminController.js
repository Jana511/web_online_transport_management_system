import User from '../models/User.js';
import Student from '../models/Student.js';
import Van from '../models/Van.js';
import { createError } from '../utils/createError.js';

// GET /api/admin/stats  (admin only)
// Returns totals for the admin dashboard
export const getAdminStats = async (req, res) => {
  // Run all counts at the same time to save time
  const [parents, drivers, students, vans, pendingRequests] = await Promise.all([
    User.countDocuments({ role: 'parent' }),
    User.countDocuments({ role: 'driver' }),
    Student.countDocuments(),
    Van.countDocuments(),
    Student.countDocuments({ status: 'pending' }),
  ]);

  res.status(200).json({
    success: true,
    stats: { parents, drivers, students, vans, pendingRequests },
  });
};

// POST /api/admin/drivers  (admin only)
// Creates a DRIVER account - drivers cannot register themselves
export const createDriver = async (req, res) => {
  const { fullName, email, phone, password } = req.body || {};

  if (!fullName || !email || !phone || !password) {
    throw createError(400, 'Please fill in full name, email, phone and password');
  }

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw createError(400, 'Password must be at least 8 characters and contain letters and numbers');
  }

  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existingUser) {
    throw createError(409, 'An account with this email already exists');
  }

  const driver = await User.create({
    fullName,
    email,
    phone,
    password,
    role: 'driver', // set by the server, never from req.body
  });

  res.status(201).json({
    success: true,
    message: 'Driver account created',
    driver,
  });
};

// GET /api/admin/drivers  (admin only)
// Lists all drivers and the van each one drives
export const getDrivers = async (req, res) => {
  const drivers = await User.find({ role: 'driver' }).sort({ createdAt: -1 });

  // Find which van each driver is assigned to
  const vans = await Van.find({ driver: { $ne: null } }).select('vanNumber driver');
  const vanByDriver = new Map(vans.map((van) => [van.driver.toString(), van.vanNumber]));

  res.status(200).json({
    success: true,
    drivers: drivers.map((driver) => ({
      ...driver.toJSON(),
      vanNumber: vanByDriver.get(driver._id.toString()) || null,
    })),
  });
};

// PATCH /api/admin/drivers/:id/status  (admin only)
// Activates or deactivates a driver account
export const updateDriverStatus = async (req, res) => {
  const { isActive } = req.body || {};

  if (typeof isActive !== 'boolean') {
    throw createError(400, 'isActive must be true or false');
  }

  const driver = await User.findOne({ _id: req.params.id, role: 'driver' });
  if (!driver) {
    throw createError(404, 'Driver not found');
  }

  driver.isActive = isActive;
  await driver.save();

  res.status(200).json({
    success: true,
    message: isActive ? 'Driver activated' : 'Driver deactivated',
    driver,
  });
};