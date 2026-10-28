import express from 'express';
import {
  getMyChildren,
  addChild,
  getAllStudents,
  assignVan,
  unassignVan,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Everyone must be logged in
router.use(protect);

// Parent routes
router.get('/my', authorize('parent'), getMyChildren); // GET  /api/students/my
router.post('/', authorize('parent'), addChild); // POST /api/students

// Admin routes
router.get('/', authorize('admin'), getAllStudents); // GET   /api/students
router.patch('/:id/assign', authorize('admin'), assignVan); // PATCH /api/students/:id/assign
router.patch('/:id/unassign', authorize('admin'), unassignVan); // PATCH /api/students/:id/unassign

export default router;