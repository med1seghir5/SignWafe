import express from 'express';
import {
  getProgress,
  nextLesson,
} from '../Controller/courseController.js';
import { authMiddleware } from '../Middleware/authMiddlware.js';

const router = express.Router();

router.get('/:courseId', authMiddleware, getProgress);
router.post('/:courseId/next', authMiddleware, nextLesson);

export default router;