const express = require("express");
const TokenController = require("../../controllers/Token/TokenController");

const router = express.Router();

router.post(
    '/send-email-verification',
    TokenController.sendOrResendEmailVerificationToken
);

router.post(
    '/send-password-reset',
    TokenController.sendOrResendPasswordResetToken
);

router.post(
    '/verify-email',
    TokenController.verifyEmailUsingToken
);

router.post(
    '/reset-password',
    TokenController.resetPasswordUsingToken
);

module.exports = router;