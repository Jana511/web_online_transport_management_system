import express from 'express';
import { getVans, createVan, updateVan, deleteVan } from '../controllers/vanController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins can manage vans
router.use(protect, authorize('admin'));

router.get('/', getVans); // GET    /api/vans
router.post('/', createVan); // POST   /api/vans
router.put('/:id', updateVan); // PUT    /api/vans/:id
router.delete('/:id', deleteVan); // DELETE /api/vans/:id

export default router;