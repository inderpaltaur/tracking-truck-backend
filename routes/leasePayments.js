import express from 'express';
const router = express.Router();
import {
  getLeasePayments,
  getLeasePaymentById,
  createLeasePayment,
  generateLeasePayments,
  markPaymentReceived,
  updateLeasePayment,
  deleteLeasePayment,
  getLeasePaymentStats,
} from '../controllers/leasePaymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/', getLeasePayments);
router.get('/stats', getLeasePaymentStats);
router.get('/:id', getLeasePaymentById);

// Routes for managing lease payments (super_admin, admin, manager, staff)
router.post('/', authorize('super_admin', 'admin', 'manager'), createLeasePayment);
router.post('/generate', authorize('super_admin', 'admin', 'manager'), generateLeasePayments);
router.patch('/:id/mark-paid', authorize('super_admin', 'admin', 'manager', 'staff'), markPaymentReceived);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), updateLeasePayment);
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), deleteLeasePayment);

export default router;
