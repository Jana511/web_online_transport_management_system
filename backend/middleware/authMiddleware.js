import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createError } from '../utils/createError.js';

// ===== protect =====
// Allows the request only if it has a valid JWT token.
// The token must be sent in the header:  Authorization: Bearer <token>
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError(401, 'Not logged in. Please log in to continue.');
  }

  const token = authHeader.split(' ')[1];

  // Check the token signature and expiry date
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createError(401, 'Your session is invalid or has expired. Please log in again.');
  }

  // Make sure the user still exists and is active
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw createError(401, 'This account is no longer available. Please log in again.');
  }

  // Save the user on the request so controllers can use req.user
  req.user = user;
  next(); // continue to the next middleware or controller
};

// ===== authorize =====
// Allows the request only for the given roles.
// Usage: authorize('admin')  or  authorize('admin', 'driver')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw createError(403, 'You do not have permission to do this');
    }
    next();
  };
};