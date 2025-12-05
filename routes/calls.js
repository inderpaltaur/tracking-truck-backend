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

// Routes for managing calls (super_admin, admin, manager, staff)
router.post('/', authorize('super_admin', 'admin', 'manager', 'staff'), createCall);
router.put('/:id', authorize('super_admin', 'admin', 'manager', 'staff'), updateCall);
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), deleteCall);

export default router;