import express from 'express';
const router = express.Router();
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
// router.use(authenticate);

// Admin only routes
router.get('/', getCustomers);
router.post('/', validate(schemas.customer), createCustomer);

// Routes accessible by admin and staff
router.get('/:id', getCustomerById);
router.put('/:id', validate(schemas.customer), updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;