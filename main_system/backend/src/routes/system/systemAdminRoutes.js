const express = require("express");
const SystemAdminController = require("../../controllers/System/SystemAdminController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.SUPER_ADMIN
    ]),
    SystemAdminController.getAllSystemAdminsIfExists
);

router.post(
    '/',
    allowedRoles([
        roles.SUPER_ADMIN
    ]),
    SystemAdminController.insertSystemAdmin
);

router.delete(
    '/:system_admin_id',
    allowedRoles([
        roles.SUPER_ADMIN
    ]),
    SystemAdminController.deleteSystemAdmin
);

router.put(
    '/:system_admin_id/status',
    allowedRoles([
        roles.SUPER_ADMIN
    ]),
    SystemAdminController.updateSystemAdminStatus
);

module.exports = router;