// backend/routes/dailyLogs.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { validateNumeric } = require('../utils/validators');

function formatDailyLog(row) {
  if (!row) return null;
  return {
    $id: row.id,
    id: row.id,
    userId: row.userId,
    date: row.date,
    foods: row.foods,
    totalCalories: Number(row.totalCalories || 0),
    totalProtein: Number(row.totalProtein || 0),
    totalCarbs: Number(row.totalCarbs || 0),
    totalFat: Number(row.totalFat || 0),
    createdAt: row.createdAt,
  };
}

/**
 * GET /api/daily-logs
 * Query logs by date range or single date
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const targetUserId = req.query.userId || req.user.accountId;
    if (req.user.accountId !== targetUserId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access logs of another user.' });
    }

    const { startDate, endDate, date } = req.query;

    let query = 'SELECT * FROM daily_logs WHERE userId = ?';
    const params = [targetUserId];

    if (startDate && endDate) {
      query += ' AND datetime(date) >= datetime(?) AND datetime(date) <= datetime(?)';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND datetime(date) >= datetime(?)';
      params.push(startDate);
    } else if (endDate) {
      query += ' AND datetime(date) <= datetime(?)';
      params.push(endDate);
    } else if (date) {
      // Single date matching start and end of that day
      query += ' AND date(date) = date(?)';
      params.push(date);
    }

    query += ' ORDER BY datetime(date) DESC';

    const rows = db.prepare(query).all(...params);

    return res.json({
      total: rows.length,
      documents: rows.map(formatDailyLog),
    });
  } catch (err) {
    console.error('Query daily logs error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve daily logs.' });
  }
});

/**
 * POST /api/daily-logs
 * Create a new daily log
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { userId, date, foods, totalCalories, totalProtein, totalCarbs, totalFat } = req.body;
    const targetUserId = userId || req.user.accountId;

    if (req.user.accountId !== targetUserId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const id = req.body.id || req.body.$id || uuidv4();
    const logDate = date || new Date().toISOString();
    const foodsJson = typeof foods === 'string' ? foods : JSON.stringify(foods || []);
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO daily_logs (id, userId, date, foods, totalCalories, totalProtein, totalCarbs, totalFat, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      targetUserId,
      logDate,
      foodsJson,
      validateNumeric(totalCalories) ? parseFloat(totalCalories) : 0,
      validateNumeric(totalProtein) ? parseFloat(totalProtein) : 0,
      validateNumeric(totalCarbs) ? parseFloat(totalCarbs) : 0,
      validateNumeric(totalFat) ? parseFloat(totalFat) : 0,
      createdAt
    );

    const saved = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(id);
    return res.status(201).json(formatDailyLog(saved));
  } catch (err) {
    console.error('Create daily log error:', err.message);
    return res.status(500).json({ error: 'Failed to create daily log.' });
  }
});

/**
 * PUT /api/daily-logs/:id
 * Update an existing daily log
 */
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const logId = req.params.id;
    const existing = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(logId);

    if (!existing) {
      return res.status(404).json({ error: 'Daily log not found.' });
    }

    if (existing.userId !== req.user.accountId) {
      return res.status(403).json({ error: 'Forbidden: Cannot update another user\'s log.' });
    }

    const { foods, totalCalories, totalProtein, totalCarbs, totalFat } = req.body;

    const updates = [];
    const params = [];

    if (foods !== undefined) {
      updates.push('foods = ?');
      params.push(typeof foods === 'string' ? foods : JSON.stringify(foods));
    }
    if (totalCalories !== undefined) {
      updates.push('totalCalories = ?');
      params.push(validateNumeric(totalCalories) ? parseFloat(totalCalories) : 0);
    }
    if (totalProtein !== undefined) {
      updates.push('totalProtein = ?');
      params.push(validateNumeric(totalProtein) ? parseFloat(totalProtein) : 0);
    }
    if (totalCarbs !== undefined) {
      updates.push('totalCarbs = ?');
      params.push(validateNumeric(totalCarbs) ? parseFloat(totalCarbs) : 0);
    }
    if (totalFat !== undefined) {
      updates.push('totalFat = ?');
      params.push(validateNumeric(totalFat) ? parseFloat(totalFat) : 0);
    }

    if (updates.length > 0) {
      params.push(logId);
      db.prepare(`UPDATE daily_logs SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(logId);
    return res.json(formatDailyLog(updated));
  } catch (err) {
    console.error('Update daily log error:', err.message);
    return res.status(500).json({ error: 'Failed to update daily log.' });
  }
});

/**
 * DELETE /api/daily-logs/:id
 */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const logId = req.params.id;
    const existing = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(logId);
    if (!existing) {
      return res.status(404).json({ error: 'Daily log not found.' });
    }

    if (existing.userId !== req.user.accountId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    db.prepare('DELETE FROM daily_logs WHERE id = ?').run(logId);
    return res.json({ message: 'Daily log deleted successfully.' });
  } catch (err) {
    console.error('Delete daily log error:', err.message);
    return res.status(500).json({ error: 'Failed to delete daily log.' });
  }
});

module.exports = router;
