import mongoose from 'mongoose';

// Rules for every student (child) document
const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Student's name is required"],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot be longer than 100 characters'],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true, // e.g. "Grade 5"
    },
    school: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },

    // ===== Relationship: which parent this child belongs to =====
    parent: {
      type: mongoose.Schema.Types.ObjectId, // stores the parent's _id
      ref: 'User', // the ID points to the User collection
      required: [true, 'Parent is required'],
    },

    // ===== Pickup details =====
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    // Map position for Leaflet maps later (optional for now)
    pickupLocation: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },

    // Who to call if the parent cannot be reached
    emergencyContact: {
      name: { type: String, trim: true },
      phone: {
        type: String,
        trim: true,
        match: [/^0\d{9}$/, 'Phone must be 10 digits starting with 0'],
      },
    },

    // ===== Transport request status =====
    // pending  = parent requested van service, waiting for admin
    // assigned = admin assigned a van and driver (Day 8)
    // inactive = no longer using the service
    status: {
      type: String,
      enum: ['pending', 'assigned', 'inactive'],
      default: 'pending',
    },
        // ===== Which van this student is assigned to (set by admin) =====
    van: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Van',
      default: null, // null = not assigned yet
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot be longer than 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Makes "find all children of this parent" searches fast
studentSchema.index({ parent: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;