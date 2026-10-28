import jwt from 'jsonwebtoken';

// Creates a signed JWT token containing the user's ID and role
export const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in the .env file');
  }

  return jwt.sign(
    { id: user._id.toString(), role: user.role }, // data inside the token (no password!)
    process.env.JWT_SECRET, // secret key used to sign it
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' } // how long it is valid
  );
};