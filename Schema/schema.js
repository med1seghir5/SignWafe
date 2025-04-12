import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  Email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,   
    trim: true,  
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },
  Username: {
    type: String,
    required: [true, "Please enter a username"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"]
  },
  Password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [5, "Password must be at least 5 characters long"]
  },
  Role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);

const courseSchema = new Schema({
  level: {
    type: String,
    required: [true, "Please enter a course level"],
    unique: true,
    min: [1, "Level must be at least 1"]
  },
  Title: {
    type: String,
    required: [true, "Please enter a title"],
    trim: true
  },
  Description: {
    type: String,
    required: [true, "Please enter a description"],
    trim: true
  },
  Content: {
    type: String,
    required: [true, "Please enter the number of lessons"]
  }
}, { timestamps: true });

export const Course = mongoose.model("Course", courseSchema);

const progressSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonIndex: {
    type: Number,
    default: 0,
    min: [0, "Lesson index cannot be negative"]
  },
  quizCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export const Progress = mongoose.model("Progress", progressSchema);
