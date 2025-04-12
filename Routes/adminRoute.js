import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin } from '../Middleware/isAdmin.js';
import { addCourses, deleteCourses, updateCourses } from '../Controller/courseController.js';

const router = express.Router();

router.post('/', authMiddleware, isAdmin, addCourses);

router.put('/:courseId', authMiddleware, isAdmin, updateCourses);

router.delete('/:courseId', authMiddleware, isAdmin, deleteCourses);

export default router;