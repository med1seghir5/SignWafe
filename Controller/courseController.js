import e from 'express';
import { Progress } from '../Schema/schema.js';
import { Course } from '../Schema/schema.js';
import mongoose from 'mongoose';

export const addCourses = async (req, res) => {
  try {
    const { level, Title, Description, Content } = req.body;

    if (!level || !Title || !Description || !Content) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const course = new Course({
      level,
      Title,
      Description,
      Content,
    });

    await course.save();

    return res.status(201).json({
      message: "Course created successfully.",
      course
    });
  } catch (err) {
    return res.status(400).json({ message: "Course creation failed.", error: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    return res.status(200).json(courses);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch courses.", error: err.message });
  }
}

export const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    return res.status(200).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch course.", error: err.message });
  }
}

export const deleteCourses = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    return res.status(200).json({ message: "Course successfully deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete course.", error: err.message });
  }
};

export const updateCourses = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }

    return res.status(200).json({
      message: "Course updated successfully.",
      updatedCourse
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update course.", error: err.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found." });
    }

    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch progress.", error: err.message });
  }
};

export const nextLesson = async (req, res) => {
  try {
    const { courseId } = req.params;

    let progress = await Progress.findOne({ user: req.userId, course: courseId });

    if (!progress) {
      progress = new Progress({ user: req.userId, course: courseId });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (progress.lessonIndex < course.content - 1) {
      progress.lessonIndex += 1;
    }

    await progress.save();
    res.status(200).json({ message: "Lesson progressed.", progress });
  } catch (err) {
    res.status(500).json({ message: "Failed to progress.", error: err.message });
  }
};
