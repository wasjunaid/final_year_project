const express = require("express");
const AuthController = require("../../controllers/Auth/AuthController");

const router = express.Router();

router.post(
    "/sign-in",
    AuthController.signIn
);

module.exports = router;