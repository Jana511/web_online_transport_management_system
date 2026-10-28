import mongoose from 'mongoose';

// One stop on a route (e.g. "Galle Bus Stand" at 06:30)
const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stop name is required'],
    trim: true,
  },
  order: {
    type: Number,
    required: [true, 'Stop order is required'],
    min: [1, 'Stop order must start from 1'],
  },
  pickupTime: {
    type: String,
    trim: true,
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Pickup time must be in HH:MM format (e.g. 06:30)'],
  },
});

// A van route: a name, the school it goes to, and ordered stops
const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Route name is required'],
      unique: true,
      trim: true,
    },
    school: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    stops: {
      type: [stopSchema], // a list of stops
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);

export default Route;