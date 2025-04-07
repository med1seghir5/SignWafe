import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Users } from '../Schema/schema.js';
import dotenv from 'dotenv';

dotenv.config();

export const Register = async (req, res) => {
  const { Email, Username, Password, ConfirmPassword } = req.body;
  
  try {
    const existUser = await Users.findOne({ 
      $or: [
        { Email },
        { Username }
      ]
    });
    
    if (existUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists" 
      });
    }
    
    if (Password !== ConfirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }
    
    const hashedPassword = await bcrypt.hash(Password, 10);
    
    const user = new Users({
      Email,
      Username,
      Password: hashedPassword
    });
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.Password;
    
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse
    });
    
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: err.message
    });
  }
};

export const Login = async (req, res) => {
  const { Email, Username, Password } = req.body;
  
  try {
    const user = await Users.findOne({
      $or: [
        { Email },
        { Username }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }
    
    // Correction ici : utiliser _id au lieu de id
    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.SECRET_ACCESS,
      { expiresIn: "15m" }
    );
    
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.SECRET_REFRESH,
      { expiresIn: "7d" }
    );
    
    user.refreshToken = refreshToken;
    await user.save();
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };
    
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });
    
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    const userResponse = {
      id: user._id,
      Email: user.Email,
      Username: user.Username
    };
    
    return res.json({
      success: true,
      message: "Logged in successfully",
      user: userResponse
    });
    
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message
    });
  }
};

export const Logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    if (refreshToken) {
      await Users.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }
    
    return res.json({ 
      success: true,
      message: "Logged out successfully" 
    });
    
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: err.message
    });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return res.status(403).json({ 
      success: false,
      message: "No refresh token provided" 
    });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.SECRET_REFRESH);
    
    const user = await Users.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ 
        success: false,
        message: "Invalid refresh token" 
      });
    }
    
    const newAccessToken = jwt.sign(
      { id: user._id },
      process.env.SECRET_ACCESS,
      { expiresIn: "15m" }
    );
    
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000
    });
    
    return res.json({ 
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken 
    });
    
  } catch (err) {
    console.error("Refresh token error:", err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Refresh token expired" 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      message: "Invalid refresh token" 
    });
  }
};

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || 
                 req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided" 
      });
    }
    
    const decoded = jwt.verify(token, process.env.SECRET_ACCESS);
    const user = await Users.findById(decoded.id).select('-Password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    req.user = user;
    next();
    
  } catch (err) {
    console.error("Authentication error:", err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
};