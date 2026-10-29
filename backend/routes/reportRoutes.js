import express from 'express';
import {
  createReport,
  getMyReports,
  getParentAlerts,
  getAllReports,
  updateReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Everyone must be logged in
router.use(protect);

// Driver + parent
router.post('/', authorize('driver', 'parent'), createReport); // POST /api/reports
router.get('/my', authorize('driver', 'parent'), getMyReports); // GET  /api/reports/my

// Parent
router.get('/alerts', authorize('parent'), getParentAlerts); // GET  /api/reports/alerts

// Admin
router.get('/', authorize('admin'), getAllReports); // GET   /api/reports
router.patch('/:id', authorize('admin'), updateReport); // PATCH /api/reports/:id

export default router;