/**
 * Module dependencies
 */
const jwt = require('jsonwebtoken'),
  config = require('./env/all');

module.exports = {
  /**
   * Generate token for user
   *
   * @param {any} user - The user details
   * @returns {string} - The token generated
   */
  generateToken(user) {
    const token = jwt.sign({
      user: {
        id: user._id,
      }
    }, config.jwtSecret, {
      expiresIn: 60 * 60 * 24,
    });
    return token;
  },
};
