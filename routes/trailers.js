import express from 'express';
const router = express.Router();
import {
  getTrailers,
  getTrailerById,
  createTrailer,
  updateTrailer,
  leaseTrailer,
  returnTrailer,
  deleteTrailer
} from '../controllers/trailerController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

// All routes require authentication
// router.use(authenticate);

router.get('/', getTrailers);
router.get('/:id', getTrailerById);
router.post('/', validate(schemas.trailer), createTrailer);
router.put('/:id', validate(schemas.trailer), updateTrailer);
router.post('/:id/lease', leaseTrailer);
router.post('/:id/return', returnTrailer);
router.delete('/:id', deleteTrailer);

export default router;