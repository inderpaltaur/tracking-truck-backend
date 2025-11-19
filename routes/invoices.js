import express from 'express';
const router = express.Router();
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', validate(schemas.invoice), createInvoice);
router.put('/:id', validate(schemas.invoice), updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;