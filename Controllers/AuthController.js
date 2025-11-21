const db = require('../db');
const PasswordReset = require('../Models/PasswordReset');

/**
 * AuthController - Centralized authentication and password management
 */
const AuthController = {
  /**
   * User-initiated forgot password request
   * Creates OTP and returns mock email for display
   */
  async forgotPassword(req, res) {
    try {
      const email = (req.body.email || '').toLowerCase().trim();
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      // Check if user exists
      const [rows] = await db.query('SELECT id, email, username FROM users WHERE email = ?', [email]);
      if (!rows || !rows[0]) {
        // Don't reveal if user exists for security, but return success
        return res.json({ 
          success: true, 
          message: 'If this email exists, a password reset code has been sent.',
          mockEmail: null 
        });
      }

      const user = rows[0];
      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await PasswordReset.create(email, otp, expiresAt);

      // Generate mock email content
      const mockEmail = {
        from: 'noreply@supermarketmvc.com',
        to: email,
        subject: 'Password Reset Request - Supermarket MVC',
        body: `Hello ${user.username || 'User'},\n\nYou requested to reset your password. Please use the following One-Time Password (OTP):\n\nYour OTP: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nSupermarket MVC Team`,
        otp: otp,
        expiresAt: expiresAt.toISOString()
      };

      console.log(`[MOCK EMAIL] User password reset OTP for ${email}: ${otp}`);
      return res.json({ 
        success: true, 
        message: 'Password reset code sent (mock).', 
        mockEmail 
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
  },

  /**
   * User confirms password reset with OTP
   */
  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      }

      // Validate OTP
      const otpRecord = await PasswordReset.findValid(email.toLowerCase(), otp);
      if (!otpRecord) {
        return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
      }

      // Update password (using SHA1 to match existing auth system)
      await db.query('UPDATE users SET password = SHA1(?), reset_required = FALSE WHERE email = ?', 
        [newPassword, email.toLowerCase()]);

      // Mark OTP as used
      await PasswordReset.markUsed(email.toLowerCase(), otp);

      console.log(`[AUTH] Password reset successful for ${email}`);
      return res.json({ success: true, message: 'Password reset successful. You can now login.' });
    } catch (err) {
      console.error('Reset password error:', err);
      return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
  },

  /**
   * Admin force password reset - mark user for reset on next login
   */
  async forcePasswordReset(req, res) {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      // Verify user exists
      const [rows] = await db.query('SELECT id, email, username FROM users WHERE id = ?', [userId]);
      if (!rows || !rows[0]) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Set reset_required flag
      await db.query('UPDATE users SET reset_required = TRUE WHERE id = ?', [userId]);

      console.log(`[ADMIN] Forced password reset for user ${userId} (${rows[0].email})`);
      return res.json({ 
        success: true, 
        message: `Password reset required for ${rows[0].username}. They will be prompted on next login.` 
      });
    } catch (err) {
      console.error('Force password reset error:', err);
      return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
  },

  /**
   * Generate 6-digit OTP
   */
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
};

module.exports = AuthController;
