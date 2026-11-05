
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in backend/.env');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, farmName, location, farmSize } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must contain at least 6 characters',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      farmName: farmName?.trim() || 'My Farm',
      location: location?.trim() || 'Agricultural Region',
      farmSize: farmSize || '5 Acres',
    });

    console.log('========== SIGNUP START ==========');
console.log('Email:', normalizedEmail);
console.log('Database:', User.db.name);
console.log('Collection:', User.collection.name);
console.log('MongoDB state:', User.db.readyState);

const savedUser = await newUser.save();

console.log('========== SIGNUP SUCCESS ==========');
console.log('Saved ID:', savedUser._id);

const verifyUser = await User.findById(savedUser._id);

console.log('Database verification:', verifyUser ? 'FOUND' : 'NOT FOUND');

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Farmer account created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        farmName: newUser.farmName,
        location: newUser.location,
        farmSize: newUser.farmSize,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }

    res.status(500).json({
      message: 'Server error during registration',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        farmName: user.farmName,
        location: user.location,
        farmSize: user.farmSize,
        cropsMonitored: user.cropsMonitored,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error during login',
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        message: 'Token required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    res.status(403).json({
      message: 'Invalid token',
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Password reset is not configured yet',
  });
});

// ======================================================
// PUT /api/auth/profile
// UPDATE LOGGED-IN USER PROFILE IN MONGODB
// ======================================================

router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    const {
      name,
      email,
      farmName,
      location,
      farmSize,
      cropsMonitored,
    } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          farmName: farmName?.trim() || 'My Farm',
          location: location?.trim() || 'Agricultural Region',
          farmSize: farmSize?.trim() || '',
          cropsMonitored: Array.isArray(cropsMonitored)
            ? cropsMonitored
            : [],
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Profile update error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered.',
      });
    }

    if (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session is invalid or expired. Please log in again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to update profile.',
    });
  }
});

export default router;
