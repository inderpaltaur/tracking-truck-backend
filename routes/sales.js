import express from 'express';
const router = express.Router();
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  upload
} from '../controllers/saleController.js';
import { authenticate } from '../middleware/auth.js';

// All routes require authentication
// router.use(authenticate);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', upload, createSale);
router.put('/:id', upload, updateSale);
router.delete('/:id', deleteSale);

export default router;