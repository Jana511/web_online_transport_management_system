// GET /api/health
// Returns a simple message to confirm the API is working
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SchoolRide API is running',
    timestamp: new Date().toISOString(),
  });
};