import express from 'express';
const router = express.Router();
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/taskController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/', getTasks);
router.get('/:id', getTaskById);

// Routes for creating tasks (super_admin, admin, manager, and staff)
router.post('/', authorize('super_admin', 'admin', 'manager', 'staff'), createTask);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), updateTask);
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), deleteTask);

// Update status route (accessible by assigned staff and admin)
router.patch('/:id/status', updateTaskStatus);

export default router;