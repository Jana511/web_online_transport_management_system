import mongoose from 'mongoose';

// An emergency (from a driver) or a complaint (from a parent)
const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['emergency', 'complaint'],
      required: true,
    },
    // e.g. "breakdown", "late_pickup"
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please describe the problem'],
      trim: true,
      minlength: [10, 'Please give a little more detail (at least 10 characters)'],
      maxlength: [1000, 'Description cannot be longer than 1000 characters'],
    },
    // Who sent it
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Which van it is about (if any)
    van: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Van',
      default: null,
    },
    // Which child it is about (parent complaints, optional)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
    },
    // The admin's reply
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot be longer than 500 characters'],
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

// Speeds up "open emergencies for these vans"
reportSchema.index({ van: 1, type: 1, status: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;