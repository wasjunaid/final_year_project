const express = require('express');
const { passport } = require("../../services/Auth/GoogleAuthService");
const GoogleAuthController = require("../../controllers/Auth/GoogleAuthController");

const router = express.Router();

// Store the role in session before redirecting to Google
router.get(
  '/google',
  GoogleAuthController.googleAuth
);

// Google OAuth callback
router.get(
  '/google/callback',
  GoogleAuthController.googleAuthCallback,
  passport.authenticate('google', { session: false, failureRedirect: '/sign-in?error=google_auth_failed' }),
  GoogleAuthController.googleAuthSuccess
);

module.exports = router;