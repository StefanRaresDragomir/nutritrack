// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { validateEmail, validatePassword, sanitizeString } = require('../utils/validators');

// Helper to format user document matching Appwrite structure
function formatUser(row) {
  if (!row) return null;
  return {
    $id: row.accountId,
    accountId: row.accountId,
    email: row.email,
    username: row.username,
    avatar: row.avatar || null,
    gender: row.gender || null,
    age: row.age !== null ? Number(row.age) : null,
    height: row.height !== null ? Number(row.height) : null,
    weight: row.weight !== null ? Number(row.weight) : null,
    activitylevel: row.activitylevel || null,
    createdAt: row.createdAt,
  };
}

/**
 * POST /api/auth/register
 * Rate limited and hardened against credential stuffing & injection
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'All fields (email, password, username) are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = sanitizeString(username);

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
      });
    }

    // Check existing email (parameterized query protects against SQL injection)
    const existing = db.prepare('SELECT accountId FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with bcrypt - cost factor 12 (OWASP recommended standard)
    const hashedPassword = await bcrypt.hash(password, 12);
    const accountId = uuidv4();
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO users (accountId, email, password, username, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertStmt.run(accountId, cleanEmail, hashedPassword, cleanUsername, createdAt);

    const userRow = db.prepare('SELECT * FROM users WHERE accountId = ?').get(accountId);
    const formatted = formatUser(userRow);

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      { accountId: formatted.accountId, email: formatted.email, username: formatted.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formatted,
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ error: 'An unexpected error occurred during registration.' });
  }
});

/**
 * POST /api/auth/login
 * Prevents account enumeration through uniform error messages
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!userRow) {
      // Uniform generic message prevents user enumeration
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, userRow.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const formatted = formatUser(userRow);
    const token = jwt.sign(
      { accountId: formatted.accountId, email: formatted.email, username: formatted.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: formatted,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user document
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const userRow = db.prepare('SELECT * FROM users WHERE accountId = ?').get(req.user.accountId);
    if (!userRow) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json(formatUser(userRow));
  } catch (err) {
    console.error('Get me error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

module.exports = { router, formatUser };
