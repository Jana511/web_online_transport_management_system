import Report from '../models/Report.js';
import Van from '../models/Van.js';
import Student from '../models/Student.js';
import { createError } from '../utils/createError.js';

// Allowed categories for each report type
const categoriesByType = {
  emergency: ['breakdown', 'accident', 'driver_absence', 'delay', 'other'],
  complaint: ['late_pickup', 'driver_behaviour', 'safety', 'payment', 'other'],
};

// ================= DRIVER + PARENT =================

// POST /api/reports  (driver or parent)
// Drivers send EMERGENCIES, parents send COMPLAINTS
export const createReport = async (req, res) => {
  const { category, description, studentId } = req.body || {};

  // The type comes from the user's role - never from req.body
  const type = req.user.role === 'driver' ? 'emergency' : 'complaint';

  if (!categoriesByType[type].includes(category)) {
    throw createError(400, 'Please choose a valid type of problem');
  }
  if (typeof description !== 'string' || description.trim().length < 10) {
    throw createError(400, 'Please describe the problem (at least 10 characters)');
  }

  let van = null;
  let student = null;

  if (type === 'emergency') {
    // Link the emergency to the driver's own van
    const driverVan = await Van.findOne({ driver: req.user._id });
    van = driverVan ? driverVan._id : null;
  } else if (studentId) {
    // A parent can only report about THEIR OWN child
    const child = await Student.findOne({ _id: studentId, parent: req.user._id });
    if (!child) {
      throw createError(400, 'Please choose one of your own children');
    }
    student = child._id;
    van = child.van;
  }

  const report = await Report.create({
    type,
    category,
    description,
    reportedBy: req.user._id,
    van,
    student,
  });

  res.status(201).json({
    success: true,
    message:
      type === 'emergency'
        ? 'Emergency reported. The administrator and the parents of children in your van can now see it.'
        : 'Complaint submitted. The administrator will respond soon.',
    report,
  });
};

// GET /api/reports/my  (driver or parent)
// The reports this user has sent, with the admin's responses
export const getMyReports = async (req, res) => {
  const reports = await Report.find({ reportedBy: req.user._id })
    .populate('van', 'vanNumber')
    .populate('student', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, reports });
};

// ================= PARENT =================

// GET /api/reports/alerts  (parent only)
// Unresolved emergencies from the last 24 hours for vans that carry this parent's children
export const getParentAlerts = async (req, res) => {
  const children = await Student.find({ parent: req.user._id, van: { $ne: null } }).select('van');
  const vanIds = [...new Set(children.map((child) => child.van.toString()))];

  if (vanIds.length === 0) {
    return res.status(200).json({ success: true, alerts: [] });
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const alerts = await Report.find({
    type: 'emergency',
    van: { $in: vanIds },
    status: { $ne: 'resolved' },
    createdAt: { $gte: oneDayAgo },
  })
    .select('category description van status createdAt')
    .populate('van', 'vanNumber')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, alerts });
};

// ================= ADMIN =================

// GET /api/reports  (admin only)
// Optional filters: ?status=open&type=emergency
export const getAllReports = async (req, res) => {
  const filter = {};
  if (['open', 'in_progress', 'resolved'].includes(req.query.status)) filter.status = req.query.status;
  if (['emergency', 'complaint'].includes(req.query.type)) filter.type = req.query.type;

  const reports = await Report.find(filter)
    .populate('reportedBy', 'fullName phone role')
    .populate('van', 'vanNumber')
    .populate('student', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, reports });
};

// PATCH /api/reports/:id  (admin only)
// Changes the status and/or adds a response
export const updateReport = async (req, res) => {
  const { status, adminResponse } = req.body || {};

  const report = await Report.findById(req.params.id);
  if (!report) {
    throw createError(404, 'Report not found');
  }

  if (status !== undefined) {
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      throw createError(400, 'Invalid status');
    }
    report.status = status;
    report.resolvedAt = status === 'resolved' ? new Date() : undefined;
  }

  if (adminResponse !== undefined) {
    report.adminResponse = adminResponse;
  }

  await report.save();

  res.status(200).json({ success: true, message: 'Report updated', report });
};