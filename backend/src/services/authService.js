const User = require('../models/User');
const generateToken = require('../utils/generateToken');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - { fullName, email, password }
   */
  async register({ fullName, email, password }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('A user with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password
    });

    const token = generateToken(user._id);

    return {
      user: {
        _id: user._id,
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
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user._id);

    return {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Retrieve current user profile
   * @param {string} userId
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();
