import express from 'express';
const router = express.Router();
import { register, login, getMe, logout, getPendingUsers, getAllUsers, approveUser, rejectUser } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// Public routes
router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

// Admin routes - User Management
router.get('/pending-users', authenticate, authorize('super_admin', 'admin'), getPendingUsers);
router.get('/users', authenticate, authorize('super_admin', 'admin'), getAllUsers);
router.put('/approve/:userId', authenticate, authorize('super_admin', 'admin'), approveUser);
router.put('/reject/:userId', authenticate, authorize('super_admin', 'admin'), rejectUser);

export default router;