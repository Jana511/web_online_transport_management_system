import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import { createError } from '../utils/createError.js';

// Checks text like "2026-10"
const isValidMonth = (month) =>
  typeof month === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);

// Adds up amounts: total billed, collected (paid) and outstanding (pending)
const buildSummary = (payments) =>
  payments.reduce(
    (totals, payment) => {
      totals.total += payment.amount;
      if (payment.status === 'paid') totals.collected += payment.amount;
      else totals.outstanding += payment.amount;
      return totals;
    },
    { total: 0, collected: 0, outstanding: 0 }
  );

// ================= ADMIN =================

// POST /api/payments/generate  (admin only)
// Creates a "pending" fee for every assigned student for the chosen month
export const generateMonthlyFees = async (req, res) => {
  const { month, amount } = req.body || {};
  const fee = Number(amount);

  if (!isValidMonth(month)) {
    throw createError(400, 'Please choose a valid month');
  }
  if (!Number.isFinite(fee) || fee <= 0 || fee > 100000) {
    throw createError(400, 'Monthly fee must be between 1 and 100,000');
  }

  // Students who use a van
  const students = await Student.find({ status: 'assigned' }).select('_id parent');

  // Skip students who already have a fee for this month
  const existing = await Payment.find({ month }).select('student');
  const alreadyBilled = new Set(existing.map((p) => p.student.toString()));

  const newFees = students
    .filter((s) => !alreadyBilled.has(s._id.toString()))
    .map((s) => ({ student: s._id, parent: s.parent, month, amount: fee }));

  if (newFees.length > 0) {
    await Payment.insertMany(newFees); // saves many documents in one go
  }

  res.status(201).json({
    success: true,
    message:
      newFees.length > 0
        ? `Created ${newFees.length} fee record(s) for ${month}`
        : `Every assigned student already has a fee for ${month}`,
    created: newFees.length,
  });
};

// GET /api/payments  (admin only)
// Optional filters: ?month=2026-10&status=pending
export const getPayments = async (req, res) => {
  const filter = {};
  if (isValidMonth(req.query.month)) filter.month = req.query.month;
  if (['pending', 'paid'].includes(req.query.status)) filter.status = req.query.status;

  const payments = await Payment.find(filter)
    .populate('student', 'fullName grade')
    .populate('parent', 'fullName phone')
    .sort({ month: -1, status: 1 });

  res.status(200).json({
    success: true,
    payments,
    summary: buildSummary(payments),
  });
};

// PATCH /api/payments/:id/pay  (admin only)
// Records that a fee was paid and creates a receipt number
export const markAsPaid = async (req, res) => {
  const { method } = req.body || {};

  if (!['cash', 'bank_transfer', 'card'].includes(method)) {
    throw createError(400, 'Please choose a payment method');
  }

  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    throw createError(404, 'Fee record not found');
  }
  if (payment.status === 'paid') {
    throw createError(400, 'This fee has already been paid');
  }

  payment.status = 'paid';
  payment.method = method;
  payment.paidAt = new Date();
  payment.recordedBy = req.user._id;
  // e.g. "SR-202610-A1B2C3" (month + last 6 characters of the ID)
  payment.receiptNumber = `SR-${payment.month.replace('-', '')}-${payment._id
    .toString()
    .slice(-6)
    .toUpperCase()}`;

  await payment.save();

  res.status(200).json({
    success: true,
    message: `Payment recorded. Receipt number: ${payment.receiptNumber}`,
    payment,
  });
};

// ================= PARENT =================

// GET /api/payments/my  (parent only)
// Payment history for ONLY this parent's children
export const getMyPayments = async (req, res) => {
  const payments = await Payment.find({ parent: req.user._id })
    .populate('student', 'fullName grade')
    .sort({ month: -1 });

  res.status(200).json({
    success: true,
    payments,
    summary: buildSummary(payments),
  });
};