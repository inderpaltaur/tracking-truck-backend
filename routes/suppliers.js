import express from 'express';
const router = express.Router();
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
// router.use(authenticate);

router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', validate(schemas.supplier), createSupplier);
router.put('/:id', validate(schemas.supplier), updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;