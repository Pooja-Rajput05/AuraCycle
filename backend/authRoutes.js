import express from 'express';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongodb.js';
import { User } from './userModel.js';
import { Log } from './mongodb.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'auracycle_secret_key_2024';

// Helper to sign JWT
const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    await connectToDatabase();

    const { name, email, password, lastPeriodDate, averageCycleLength, periodLength } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      lastPeriodDate: lastPeriodDate || new Date().toISOString().split('T')[0],
      averageCycleLength: Number(averageCycleLength) || 28,
      periodLength: Number(periodLength) || 5,
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastPeriodDate: user.lastPeriodDate,
        averageCycleLength: user.averageCycleLength,
        periodLength: user.periodLength,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    await connectToDatabase();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastPeriodDate: user.lastPeriodDate,
        averageCycleLength: user.averageCycleLength,
        periodLength: user.periodLength,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET CURRENT USER (protected) ─────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    await connectToDatabase();
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// ─── UPDATE PROFILE (protected) ───────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    await connectToDatabase();
    const { name, lastPeriodDate, averageCycleLength, periodLength } = req.body;

    const updated = await User.findByIdAndUpdate(
      decoded.id,
      { name, lastPeriodDate, averageCycleLength: Number(averageCycleLength), periodLength: Number(periodLength) },
      { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
