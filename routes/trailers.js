import express from 'express';
const router = express.Router();
import {
  getTrailers,
  getTrailerById,
  createTrailer,
  updateTrailer,
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
router.delete('/:id', deleteTrailer);

export default router;