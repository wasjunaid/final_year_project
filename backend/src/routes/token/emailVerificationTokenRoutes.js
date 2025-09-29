const express = require("express");
const EmailVerificationTokenController = require("../../controllers/Token/EmailVerificationTokenController");

const router = express.Router();

router.post(
    '/',
    EmailVerificationTokenController.sendOrResendEmailVerificationToken
);

router.post(
    '/verify',
    EmailVerificationTokenController.verifyEmail
);

module.exports = router;