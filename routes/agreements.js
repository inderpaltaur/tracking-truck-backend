import express from 'express';
const router = express.Router();
import {
  getAgreements,
  getAgreementById,
  createAgreement,
  updateAgreement,
  deleteAgreement,
  updateAgreementStatus
} from '../controllers/agreementController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// All routes require authentication
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/', getAgreements);
router.get('/:id', getAgreementById);

// Admin only routes
router.post('/', authorize('admin'), createAgreement);
router.put('/:id', authorize('admin'), updateAgreement);
router.delete('/:id', authorize('admin'), deleteAgreement);

// Update status route (admin only)
router.patch('/:id/status', authorize('admin'), updateAgreementStatus);

export default router;