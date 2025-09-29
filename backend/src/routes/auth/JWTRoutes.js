const express = require("express");
const JWTController = require("../../controllers/Auth/JWTController");

const router = express.Router();

router.post(
    "/refresh-jwt",
    JWTController.refreshJWT
);

module.exports = router;