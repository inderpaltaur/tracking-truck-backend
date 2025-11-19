import express from 'express';
const router = express.Router();
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  upload
} from '../controllers/purchaseController.js';
import { authenticate } from '../middleware/auth.js';

// All routes require authentication
// router.use(authenticate);

router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.post('/', upload.single('document'), createPurchase);
router.put('/:id', upload.single('document'), updatePurchase);
router.delete('/:id', deletePurchase);

export default router;