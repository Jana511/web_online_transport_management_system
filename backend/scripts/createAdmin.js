import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// Creates the first admin account using details from the .env file.
// Run with: npm run create-admin
const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in the .env file');
    process.exit(1);
  }

  await connectDB();

  // READ: check whether this admin already exists
  const existingUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existingUser) {
    console.log(`An account with ${existingUser.email} already exists (role: ${existingUser.role})`);
  } else {
    // CREATE: save a new admin (the password is hashed automatically)
    const admin = await User.create({
      fullName: ADMIN_NAME || 'SchoolRide Admin',
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE || '0700000000',
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin account created: ${admin.email}`);
  }

  // Close the database connection so the script can finish
  await mongoose.disconnect();
};

createAdmin().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});