import express from 'express';
const router = express.Router();
import { getDashboard } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

// All routes require authentication
router.use(authenticate);

router.get('/', getDashboard);

export default router;