import mongoose from 'mongoose';

// Connects to MongoDB using the MONGO_URI from the .env file
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing in the .env file');
    process.exit(1); // stop the app - it cannot work without a database
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.name} database`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;