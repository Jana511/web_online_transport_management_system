import express from 'express';
import {
  getDriverTodayTrip,
  updateStudentTripStatus,
  markAllArrived,
  reportDelay,
  getMyChildrenTripStatus,
} from '../controllers/tripController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Everyone must be logged in
router.use(protect);

// Driver routes
router.get('/today', authorize('driver'), getDriverTodayTrip);
router.patch('/today/students/:studentId', authorize('driver'), updateStudentTripStatus);
router.patch('/today/arrived', authorize('driver'), markAllArrived);
router.post('/today/delay', authorize('driver'), reportDelay);

// Parent route
router.get('/my-children', authorize('parent'), getMyChildrenTripStatus);

export default router;