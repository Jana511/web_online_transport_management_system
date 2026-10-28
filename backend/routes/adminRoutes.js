import express from 'express';
import {
  getAdminStats,
  createDriver,
  getDrivers,
  updateDriverStatus,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every route in this file needs: a valid token AND the admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', getAdminStats);

// Drivers
router.get('/drivers', getDrivers); // GET   /api/admin/drivers
router.post('/drivers', createDriver); // POST  /api/admin/drivers
router.patch('/drivers/:id/status', updateDriverStatus); // PATCH /api/admin/drivers/:id/status

export default router;