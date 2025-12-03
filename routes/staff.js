import express from 'express';
const router = express.Router();
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staffController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Routes for viewing staff (admin and staff)
router.get('/', authorize('admin', 'staff'), getStaff);
router.post('/', authorize('admin', 'staff'), validate(schemas.staff), createStaff);

// Routes accessible by admin and staff
router.get('/:id', getStaffById);
router.put('/:id', authorize('admin'), validate(schemas.staff), updateStaff);
router.delete('/:id', authorize('admin'), deleteStaff);

export default router;