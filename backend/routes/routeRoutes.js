import express from 'express';
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../controllers/routeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins can manage van routes
router.use(protect, authorize('admin'));

router.get('/', getRoutes); // GET    /api/routes
router.post('/', createRoute); // POST   /api/routes
router.put('/:id', updateRoute); // PUT    /api/routes/:id
router.delete('/:id', deleteRoute); // DELETE /api/routes/:id

export default router;