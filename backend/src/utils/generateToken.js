const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for an authenticated user ID
 * @param {string|mongoose.Types.ObjectId} id - The user ID
 * @returns {string} Signed JWT
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_only_123';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

module.exports = generateToken;
