import mongoose from 'mongoose';

const vanSchema = new mongoose.Schema(
  {
    vanNumber: {
      type: String,
      required: [true, 'Van number is required'],
      unique: true, // two vans cannot have the same number
      trim: true,
      uppercase: true, // "nb-1234" is saved as "NB-1234"
    },
    model: {
      type: String,
      trim: true, // e.g. "Toyota KDH"
    },
    capacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [60, 'Capacity cannot be more than 60'],
    },
    // The driver of this van (a User with role "driver")
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // The route this van follows
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Van = mongoose.model('Van', vanSchema);

export default Van;