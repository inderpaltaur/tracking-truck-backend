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

// Routes for viewing staff (super_admin, admin, manager, and staff)
router.get('/', authorize('super_admin', 'admin', 'manager', 'staff'), getStaff);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(schemas.staff), createStaff);

// Routes accessible by super_admin, admin, and manager
router.get('/:id', getStaffById);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(schemas.staff), updateStaff);
router.delete('/:id', authorize('super_admin', 'admin'), deleteStaff);

export default router;