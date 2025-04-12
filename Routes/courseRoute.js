import express from 'express';
import { authMiddleware } from '../Middleware/authMiddlware.js';
import { isAdmin } from '../Middleware/isAdmin.js';
import {
  addCourses,
  deleteCourses,
  getCourseById,
  getCourses,
  updateCourses,
} from '../Controller/courseController.js';

const router = express.Router();

router.post('/', authMiddleware, isAdmin, addCourses);

router.put('/:courseId', authMiddleware, isAdmin, updateCourses);

router.get('/', authMiddleware, getCourses );

router.get('/:id', authMiddleware, getCourseById );

router.delete('/:courseId', authMiddleware, isAdmin, deleteCourses);

export default router;