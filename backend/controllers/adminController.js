import User from '../models/User.js';
import Student from '../models/Student.js';

// GET /api/admin/stats  (admin only)
// Returns totals for the admin dashboard
export const getAdminStats = async (req, res) => {
  // Run the three counts at the same time to save time
  const [parents, drivers, students] = await Promise.all([
    User.countDocuments({ role: 'parent' }),
    User.countDocuments({ role: 'driver' }),
    Student.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    stats: { parents, drivers, students },
  });
};