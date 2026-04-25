const express = require("express");
const LogController = require("../../controllers/Log/LogController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.ADMIN
    ]),
    LogController.getLogsIfExists
);

module.exports = router;