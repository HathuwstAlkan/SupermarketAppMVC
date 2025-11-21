const db = require('../db');

/**
 * PasswordReset Model
 * Handles OTP storage and validation for password reset flows
 */
const PasswordReset = {
  /**
   * Create a new OTP record
   * @param {string} email - User's email address
   * @param {string} otp - 6-digit OTP code
   * @param {Date} expiresAt - Expiration timestamp
   * @returns {Promise<number>} Insert ID
   */
  async create(email, otp, expiresAt) {
    const [result] = await db.query(
      'INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)',
      [email.toLowerCase(), otp, expiresAt]
    );
    return result.insertId;
  },

  /**
   * Find a valid (non-expired, unused) OTP for the given email
   * @param {string} email - User's email address
   * @param {string} otp - OTP code to validate
   * @returns {Promise<Object|null>} OTP record if valid, null otherwise
   */
  async findValid(email, otp) {
    const [rows] = await db.query(
      'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email.toLowerCase(), otp]
    );
    return rows && rows[0] ? rows[0] : null;
  },

  /**
   * Mark an OTP as used after successful password reset
   * @param {string} email - User's email address
   * @param {string} otp - OTP code to mark as used
   * @returns {Promise<boolean>} True if marked successfully
   */
  async markUsed(email, otp) {
    const [result] = await db.query(
      'UPDATE password_resets SET used = TRUE WHERE email = ? AND otp = ? AND used = FALSE',
      [email.toLowerCase(), otp]
    );
    return result.affectedRows > 0;
  },

  /**
   * Clean up expired OTP records (optional maintenance)
   * @returns {Promise<number>} Number of records deleted
   */
  async cleanupExpired() {
    const [result] = await db.query(
      'DELETE FROM password_resets WHERE expires_at < NOW() OR (used = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR))'
    );
    return result.affectedRows;
  }
};

module.exports = PasswordReset;
