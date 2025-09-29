const express = require("express");
const PasswordResetTokenController = require("../../controllers/Token/PasswordResetTokenController");

const router = express.Router();

router.post(
    '/',
    PasswordResetTokenController.sendOrResendPasswordResetToken
);

router.post(
    '/reset',
    PasswordResetTokenController.resetPassword
);

module.exports = router;