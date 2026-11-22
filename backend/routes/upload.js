// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration with sanitized, unpredictable filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const fileId = `${uuidv4()}${safeExt}`;
    cb(null, fileId);
  },
});

// File filter enforcing image MIME types to mitigate malicious file upload attacks
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit (OWASP resource exhaustion mitigation)
  },
});

/**
 * POST /api/upload/avatar
 * Secure file upload with strict MIME and size checks
 */
router.post('/avatar', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const fileId = req.file.filename;

    return res.status(201).json({
      $id: fileId,
      id: fileId,
      fileId,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    console.error('Avatar upload error:', err.message);
    return res.status(500).json({ error: 'Failed to process file upload.' });
  }
});

/**
 * GET /api/uploads/:fileId
 * Securely serve uploaded avatar files with directory traversal mitigation
 */
router.get('/:fileId', (req, res) => {
  try {
    // Sanitize fileId to prevent Directory Traversal attacks (OWASP A01/A05)
    const safeFileName = path.basename(req.params.fileId);
    const filePath = path.join(uploadsDir, safeFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }

    return res.sendFile(filePath);
  } catch (err) {
    console.error('File retrieval error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve file.' });
  }
});

/**
 * DELETE /api/uploads/:fileId
 */
router.delete('/:fileId', authenticateToken, (req, res) => {
  try {
    const safeFileName = path.basename(req.params.fileId);
    const filePath = path.join(uploadsDir, safeFileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({ message: 'File deleted successfully.' });
  } catch (err) {
    console.error('File delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete file.' });
  }
});

module.exports = router;
