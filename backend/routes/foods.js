// backend/routes/foods.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeString, validateNumeric } = require('../utils/validators');

function formatFood(row) {
  if (!row) return null;
  return {
    $id: row.id,
    id: row.id,
    name: row.name,
    calories: Number(row.calories),
    protein: Number(row.protein),
    carbs: Number(row.carbs),
    fat: Number(row.fat),
    barcode: row.barcode || null,
    createdBy: row.createdBy || 'anonim',
    createdAt: row.createdAt,
  };
}

/**
 * POST /api/foods
 * Create a new custom or catalog food entry
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, barcode, createdBy } = req.body;

    if (!name || !validateNumeric(calories) || !validateNumeric(protein) || !validateNumeric(carbs) || !validateNumeric(fat)) {
      return res.status(400).json({ error: 'Name and valid numerical macronutrients (calories, protein, carbs, fat) are required.' });
    }

    const id = req.body.id || req.body.$id || uuidv4();
    const cleanName = sanitizeString(name);
    const cleanBarcode = barcode ? sanitizeString(barcode) : null;
    const author = createdBy ? sanitizeString(createdBy) : (req.user?.username || 'anonim');
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO foods (id, name, calories, protein, carbs, fat, barcode, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      cleanName,
      parseFloat(calories),
      parseFloat(protein),
      parseFloat(carbs),
      parseFloat(fat),
      cleanBarcode,
      author,
      createdAt
    );

    const saved = db.prepare('SELECT * FROM foods WHERE id = ?').get(id);
    return res.status(201).json(formatFood(saved));
  } catch (err) {
    console.error('Create food error:', err.message);
    return res.status(500).json({ error: 'Failed to create food item.' });
  }
});

/**
 * GET /api/foods/search
 * Search foods by query substring
 */
router.get('/search', authenticateToken, (req, res) => {
  try {
    const query = req.query.q || '';
    const cleanQ = sanitizeString(query);

    let rows;
    if (cleanQ) {
      rows = db.prepare(`
        SELECT * FROM foods 
        WHERE LOWER(name) LIKE ? 
        ORDER BY createdAt DESC 
        LIMIT 100
      `).all(`%${cleanQ.toLowerCase()}%`);
    } else {
      rows = db.prepare('SELECT * FROM foods ORDER BY createdAt DESC LIMIT 100').all();
    }

    return res.json({
      total: rows.length,
      documents: rows.map(formatFood),
    });
  } catch (err) {
    console.error('Search foods error:', err.message);
    return res.status(500).json({ error: 'Failed to search foods.' });
  }
});

/**
 * GET /api/foods/barcode/:barcode
 * Find foods matching specific barcode
 */
router.get('/barcode/:barcode', authenticateToken, (req, res) => {
  try {
    const barcode = req.params.barcode;
    const rows = db.prepare('SELECT * FROM foods WHERE barcode = ?').all(barcode);

    return res.json({
      total: rows.length,
      documents: rows.map(formatFood),
    });
  } catch (err) {
    console.error('Barcode search error:', err.message);
    return res.status(500).json({ error: 'Failed to search food by barcode.' });
  }
});

/**
 * GET /api/foods
 * List foods
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const rows = db.prepare('SELECT * FROM foods ORDER BY createdAt DESC LIMIT ?').all(limit);

    return res.json({
      total: rows.length,
      documents: rows.map(formatFood),
    });
  } catch (err) {
    console.error('List foods error:', err.message);
    return res.status(500).json({ error: 'Failed to list foods.' });
  }
});

module.exports = router;
