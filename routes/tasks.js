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

// Routes for creating tasks (admin and staff)
router.post('/', authorize('admin', 'staff'), createTask);
router.put('/:id', authorize('admin'), updateTask);
router.delete('/:id', authorize('admin'), deleteTask);

// Update status route (accessible by assigned staff and admin)
router.patch('/:id/status', updateTaskStatus);

export default router;