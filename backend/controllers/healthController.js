import mongoose from 'mongoose';

// GET /api/health
// Returns a simple message to confirm the API and database are working
export const getHealth = (req, res) => {
  // readyState 1 means "connected"
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    success: true,
    message: 'SchoolRide API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
};