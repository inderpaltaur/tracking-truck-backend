import express from 'express';
const router = express.Router();
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
// router.use(authenticate);

// Admin only routes
router.get('/', getTransactions);
router.post('/', validate(schemas.transaction), createTransaction);

// Routes accessible by admin and staff
router.get('/:id', getTransactionById);
router.put('/:id', validate(schemas.transaction), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;