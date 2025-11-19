import express from 'express';
const router = express.Router();
import {
  getStaffReport,
  getFinancialReport,
  getProfitLossReport,
  getMonthlyRevenue,
  getTrailerDashboard
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

// All routes require authentication
// router.use(authenticate);

router.get('/staff', getStaffReport);
router.get('/financial', getFinancialReport);
router.get('/profit-loss', getProfitLossReport);
router.get('/monthly-revenue', getMonthlyRevenue);
router.get('/trailer-dashboard', getTrailerDashboard);

export default router;