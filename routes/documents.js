import express from 'express';
const router = express.Router();
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  upload
} from '../controllers/documentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// All routes require authentication
// router.use(authenticate);

// Admin only routes
router.get('/', getDocuments);
router.post('/', upload.single('document'), uploadDocument);

// Routes accessible by admin and staff
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);

export default router;