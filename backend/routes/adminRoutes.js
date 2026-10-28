import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every route in this file needs: a valid token AND the admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', getAdminStats);

export default router;