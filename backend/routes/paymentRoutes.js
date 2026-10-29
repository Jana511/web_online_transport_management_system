import express from 'express';
import {
  generateMonthlyFees,
  getPayments,
  markAsPaid,
  getMyPayments,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Everyone must be logged in
router.use(protect);

// Parent
router.get('/my', authorize('parent'), getMyPayments); // GET /api/payments/my

// Admin
router.get('/', authorize('admin'), getPayments); // GET   /api/payments
router.post('/generate', authorize('admin'), generateMonthlyFees); // POST  /api/payments/generate
router.patch('/:id/pay', authorize('admin'), markAsPaid); // PATCH /api/payments/:id/pay

export default router;