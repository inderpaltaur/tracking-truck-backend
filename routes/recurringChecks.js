import express from 'express';
const router = express.Router();
import {
  getRecurringChecks,
  createRecurringCheck,
  updateRecurringCheck,
  deleteRecurringCheck
} from '../controllers/recurringCheckController.js';
import { authenticate } from '../middleware/auth.js';

// All routes require authentication
router.use(authenticate);

router.get('/', getRecurringChecks);
router.post('/', createRecurringCheck);
router.put('/:id', updateRecurringCheck);
router.delete('/:id', deleteRecurringCheck);

export default router;