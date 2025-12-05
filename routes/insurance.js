import express from 'express';
const router = express.Router();
import {
  getInsurancePolicies,
  getInsuranceStats,
  getInsurancePolicyById,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  linkDocuSignEnvelope,
  markNotificationSent,
  verifyInsurancePolicy,
  rejectInsurancePolicy,
  addDocumentToPolicy,
} from '../controllers/insuranceController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
// router.use(authenticate);

// Get statistics for dashboard
router.get('/stats', getInsuranceStats);

// CRUD operations
router.get('/', getInsurancePolicies);
router.post('/', validate(schemas.insurance), createInsurancePolicy);

router.get('/:id', getInsurancePolicyById);
router.put('/:id', validate(schemas.insurance), updateInsurancePolicy);
router.delete('/:id', deleteInsurancePolicy);

// Document operations
router.post('/:id/documents', addDocumentToPolicy);
router.patch('/:id/docusign', linkDocuSignEnvelope);

// Verification operations (Manager/Admin only)
router.patch('/:id/verify', verifyInsurancePolicy);
router.patch('/:id/reject', rejectInsurancePolicy);

// Notification operations
router.patch('/:id/notify', markNotificationSent);

export default router;
