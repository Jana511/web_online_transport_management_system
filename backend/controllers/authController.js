import User from '../models/User.js';
import { createError } from '../utils/createError.js';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/register
// Creates a PARENT account (logged in straight away)
// or a DRIVER account (must wait for admin approval)
export const registerUser = async (req, res) => {
  const { fullName, email, phone, password, role } = req.body || {};

  // Only "parent" or "driver" can register themselves - NEVER "admin"
  const accountType = role === 'driver' ? 'driver' : 'parent';

  // 1. Check all required fields are present
  if (!fullName || !email || !phone || !password) {
    throw createError(400, 'Please fill in full name, email, phone and password');
  }

  // 2. Check password strength
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw createError(400, 'Password must be at least 8 characters and contain letters and numbers');
  }

  // 3. Check the email is not already registered
  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existingUser) {
    throw createError(409, 'An account with this email already exists');
  }

  // 4. Save the new user (password is hashed automatically)
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: accountType,
    isApproved: accountType === 'parent', // drivers need admin approval
  });

  // 5a. Driver: no token - they must wait for approval
  if (accountType === 'driver') {
    return res.status(201).json({
      success: true,
      message: 'Driver account created. You can log in after the administrator approves your account.',
      user,
    });
  }

  // 5b. Parent: log in straight away
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user),
    user,
  });
};

// POST /api/auth/login
// Checks the email and password, then returns a JWT token.
// Optional "role" = which login tab was used ("parent", "driver" or "admin")
export const loginUser = async (req, res) => {
  const { email, password, role } = req.body || {};

  // 1. Both fields must be text (this also blocks database "injection" tricks)
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw createError(400, 'Please enter your email and password');
  }

  // 2. Find the user - "+password" asks for the hidden password field
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // 3. Same message for "no such email" and "wrong password"
  if (!user || !(await user.matchPassword(password))) {
    throw createError(401, 'Invalid email or password');
  }

  // 4. Check the account matches the login tab that was used
  const validRoles = ['parent', 'driver', 'admin'];
  if (typeof role === 'string' && validRoles.includes(role) && user.role !== role) {
    throw createError(403, `This is a ${user.role} account. Please use the ${user.role} login.`);
  }

  // 5. Block drivers who are not approved yet
  if (!user.isApproved) {
    throw createError(403, 'Your driver account is waiting for administrator approval. Please try again later.');
  }

  // 6. Block deactivated accounts
  if (!user.isActive) {
    throw createError(403, 'Your account has been deactivated. Please contact the administrator.');
  }

  // 7. Success
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user),
    user,
  });
};

// GET /api/auth/me  (logged-in users only)
export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};