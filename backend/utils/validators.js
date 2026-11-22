// backend/utils/validators.js

/**
 * Validate email format using RFC 5322 compliant regex pattern
 */
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim());
}

/**
 * Password policy according to OWASP / Cybersecurity guidelines:
 * - Minimum 8 characters
 * - Must contain at least one uppercase letter
 * - Must contain at least one lowercase letter
 * - Must contain at least one number
 */
function validatePassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpper && hasLower && hasNumber;
}

/**
 * Basic string sanitization to prevent stored XSS and trim unnecessary whitespace
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, ''); // strip potential HTML tags
}

/**
 * Validate if a value is a valid finite number
 */
function validateNumeric(val) {
  if (val === undefined || val === null || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && isFinite(num);
}

module.exports = {
  validateEmail,
  validatePassword,
  sanitizeString,
  validateNumeric,
};
