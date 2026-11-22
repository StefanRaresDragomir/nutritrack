// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { formatUser } = require('./auth');
const { validateEmail, validatePassword, sanitizeString, validateNumeric } = require('../utils/validators');

/**
 * PUT /api/users/:id
 * Update profile attributes (username, avatar, gender, age, height, weight, activitylevel)
 * Enforces ownership: only the user themselves can update their own profile.
 */
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const targetId = req.params.id;

    // Authorization check (Broken Object Level Authorization - BOLA prevention)
    if (req.user.accountId !== targetId) {
      return res.status(403).json({ error: 'Forbidden: You cannot modify another user profile.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE accountId = ?').get(targetId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { username, avatar, gender, age, height, weight, activitylevel } = req.body;

    const updates = [];
    const params = [];

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(sanitizeString(username));
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      params.push(sanitizeString(gender));
    }
    if (age !== undefined) {
      updates.push('age = ?');
      params.push(validateNumeric(age) ? parseInt(age, 10) : null);
    }
    if (height !== undefined) {
      updates.push('height = ?');
      params.push(validateNumeric(height) ? parseFloat(height) : null);
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      params.push(validateNumeric(weight) ? parseFloat(weight) : null);
    }
    if (activitylevel !== undefined) {
      updates.push('activitylevel = ?');
      params.push(sanitizeString(activitylevel));
    }

    if (updates.length > 0) {
      params.push(targetId);
      const sql = `UPDATE users SET ${updates.join(', ')} WHERE accountId = ?`;
      db.prepare(sql).run(...params);
    }

    const updated = db.prepare('SELECT * FROM users WHERE accountId = ?').get(targetId);
    return res.json(formatUser(updated));
  } catch (err) {
    console.error('Update user error:', err.message);
    return res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

/**
 * PUT /api/users/:id/email
 * Change email with password re-authentication
 */
router.put('/:id/email', authenticateToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (req.user.accountId !== targetId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'New email and current password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE accountId = ?').get(targetId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    // Check if email already in use
    const existing = db.prepare('SELECT accountId FROM users WHERE email = ? AND accountId != ?').get(cleanEmail, targetId);
    if (existing) {
      return res.status(409).json({ error: 'This email is already in use by another account.' });
    }

    db.prepare('UPDATE users SET email = ? WHERE accountId = ?').run(cleanEmail, targetId);
    const updated = db.prepare('SELECT * FROM users WHERE accountId = ?').get(targetId);

    return res.json(formatUser(updated));
  } catch (err) {
    console.error('Change email error:', err.message);
    return res.status(500).json({ error: 'Failed to update email.' });
  }
});

/**
 * PUT /api/users/:id/password
 * Change password with current password verification and policy enforcement
 */
router.put('/:id/password', authenticateToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (req.user.accountId !== targetId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE accountId = ?').get(targetId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE users SET password = ? WHERE accountId = ?').run(newHash, targetId);

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err.message);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

module.exports = router;
