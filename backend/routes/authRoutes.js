import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register  (public)
router.post('/register', registerUser);

// POST /api/auth/login  (public)
router.post('/login', loginUser);

// GET /api/auth/me  (logged-in users only)
router.get('/me', protect, getMe);

export default router;