// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nutritrack-secure-default-secret-key-change-in-prod';

/**
 * Authentication middleware validating the JWT token from the Authorization header.
 * Conforms to OWASP MASVS session management requirements.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No authentication token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains { accountId, email, username }
    next();
  } catch (err) {
    // Return generic error without revealing internal parsing/signing errors
    return res.status(401).json({ 
      error: 'Invalid or expired session. Please log in again.' 
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
};
