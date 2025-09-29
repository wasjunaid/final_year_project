const express = require("express");
const LogController = require("../../controllers/Log/LogController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");

const router = express.Router();

router.get(
    '/',
    allowedRoles(['super admin', 'admin']),
    LogController.getLogs
);

module.exports = router;