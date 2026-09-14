const { User } = require('../models');
const generateToken = require('../utils/generateToken');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - { fullName, email, password }
   */
  async register({ fullName, email, password }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      const error = new Error('A user with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      fullName,
      email: cleanEmail,
      password
    });

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        _id: user.id.toString(),
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Authenticate a user and return JWT
   * @param {Object} credentials - { email, password }
   */
  async login({ email, password }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user || !(await user.matchPassword(password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        _id: user.id.toString(),
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Retrieve current user profile
   * @param {number|string} userId
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();
