import mongoose from 'mongoose';

// One student's journey on this trip
const tripStudentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    // waiting -> picked_up -> at_school -> dropped_off   (or absent)
    status: {
      type: String,
      enum: ['waiting', 'picked_up', 'at_school', 'dropped_off', 'absent'],
      default: 'waiting',
    },
    pickedUpAt: Date,
    arrivedAt: Date,
    droppedOffAt: Date,
  },
  { _id: false } // no separate ID needed for each entry
);

// One trip = one van on one day
const tripSchema = new mongoose.Schema(
  {
    van: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Van',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The day as text, e.g. "2026-10-29" (Sri Lanka time)
    date: {
      type: String,
      required: true,
    },
    students: {
      type: [tripStudentSchema],
      default: [],
    },
    // Delay reported by the driver (shown to parents)
    delay: {
      minutes: { type: Number, min: 1, max: 180 },
      reason: { type: String, trim: true, maxlength: 200 },
      reportedAt: Date,
    },
  },
  { timestamps: true }
);

// Only ONE trip per van per day
tripSchema.index({ van: 1, date: 1 }, { unique: true });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;