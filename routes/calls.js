import express from 'express';
const router = express.Router();
import {
  getCalls,
  getCallById,
  createCall,
  updateCall,
  deleteCall,
  getCallStats
} from '../controllers/callController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/', getCalls);
router.get('/stats', getCallStats);
router.get('/:id', getCallById);

// Admin only routes for full CRUD
router.post('/', authorize('admin'), createCall);
router.put('/:id', authorize('admin'), updateCall);
router.delete('/:id', authorize('admin'), deleteCall);

export default router;