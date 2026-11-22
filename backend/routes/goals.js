// backend/routes/goals.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeString, validateNumeric } = require('../utils/validators');

function formatGoal(row) {
  if (!row) return null;
  return {
    $id: row.id,
    id: row.id,
    userId: row.userId,
    goalType: row.goalType,
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    startDate: row.startDate,
    createdAt: row.createdAt,
  };
}

/**
 * POST /api/goals
 * Create a new nutritional goal
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { userId, goalType, calories, protein, carbs, fat, startDate } = req.body;
    const targetUserId = userId || req.user.accountId;

    // BOLA check: user can only assign goals to themselves
    if (req.user.accountId !== targetUserId) {
      return res.status(403).json({ error: 'Forbidden: Cannot create goals for another user.' });
    }

    if (!validateNumeric(calories)) {
      return res.status(400).json({ error: 'Valid calories target is required.' });
    }

    const id = req.body.id || req.body.$id || uuidv4();
    const cleanGoalType = sanitizeString(goalType || 'custom');
    const start = startDate || new Date().toISOString();
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO goals (id, userId, goalType, calories, protein, carbs, fat, startDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      targetUserId,
      cleanGoalType,
      parseFloat(calories),
      parseFloat(protein || 0),
      parseFloat(carbs || 0),
      parseFloat(fat || 0),
      start,
      createdAt
    );

    const saved = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    return res.status(201).json(formatGoal(saved));
  } catch (err) {
    console.error('Create goal error:', err.message);
    return res.status(500).json({ error: 'Failed to create goal.' });
  }
});

/**
 * GET /api/goals
 * List goals for a user (or for current authenticated user)
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const targetUserId = req.query.userId || req.user.accountId;

    // Ensure user only retrieves their own goals
    if (req.user.accountId !== targetUserId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other users\' goals.' });
    }

    const rows = db.prepare(`
      SELECT * FROM goals 
      WHERE userId = ? 
      ORDER BY datetime(startDate) DESC, datetime(createdAt) DESC
    `).all(targetUserId);

    return res.json({
      total: rows.length,
      documents: rows.map(formatGoal),
    });
  } catch (err) {
    console.error('List goals error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve goals.' });
  }
});

module.exports = router;
