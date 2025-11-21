/**
 * Middleware to check if user is required to reset password
 * Admin can force users to reset password on next login
 */
function checkPasswordReset(req, res, next) {
  // Skip check for these routes to avoid infinite loops
  const exemptRoutes = [
    '/logout',
    '/reset-password',
    '/auth/reset-password',
    '/auth/forgot-password',
    '/api/',
    '/images/',
    '/css/',
    '/js/'
  ];

  // Check if current route is exempt
  const isExempt = exemptRoutes.some(route => req.path.startsWith(route));
  if (isExempt) {
    return next();
  }

  // Check if user is logged in and needs to reset password
  if (req.session && req.session.user && req.session.user.reset_required) {
    // Store the intended destination
    req.session.returnTo = req.originalUrl;
    
    // Redirect to password reset page with forced flag
    return res.redirect('/reset-password?forced=true');
  }

  next();
}

module.exports = checkPasswordReset;
