import User from '../models/User.js';
import { createError } from '../utils/createError.js';
import { generateToken } from '../utils/generateToken.js';

// POST /api/auth/register
// Creates a new PARENT account and logs them in
export const registerUser = async (req, res) => {
  // req.body can be empty if no JSON was sent, so use {} as a fallback
  const { fullName, email, phone, password } = req.body || {};

  // 1. Check all required fields are present
  if (!fullName || !email || !phone || !password) {
    throw createError(400, 'Please fill in full name, email, phone and password');
  }

  // 2. Check password strength (same rule as the register form)
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw createError(400, 'Password must be at least 8 characters and contain letters and numbers');
  }

  // 3. Check the email is not already registered
  const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existingUser) {
    throw createError(409, 'An account with this email already exists');
  }

  // 4. Save the new user - role is ALWAYS "parent" here (never taken from req.body)
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: 'parent',
  });

  // 5. Log the new parent in straight away by giving them a token
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: generateToken(user),
    user,
  });
};

// POST /api/auth/login
// Checks the email and password, then returns a JWT token
export const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  // 1. Both fields must be text (this also blocks database "injection" tricks)
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw createError(400, 'Please enter your email and password');
  }

  // 2. Find the user - "+password" asks for the hidden password field
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // 3. Check the password. We use the SAME message for "no such email" and
  //    "wrong password", so attackers cannot find out which emails are registered.
  if (!user || !(await user.matchPassword(password))) {
    throw createError(401, 'Invalid email or password');
  }

  // 4. Block deactivated accounts
  if (!user.isActive) {
    throw createError(403, 'Your account has been deactivated. Please contact the administrator.');
  }

  // 5. Success - send the token and user details (password removed by toJSON)
  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user),
    user,
  });
};
// GET /api/auth/me
export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};