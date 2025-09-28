const express = require("express");
const SystemAdminController = require("../../controllers/System/SystemAdminController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");

const router = express.Router();

router.get(
    '/',
    allowedRoles(['super admin']),
    SystemAdminController.getAllSystemAdmins
);

router.post(
    '/',
    allowedRoles(['super admin']),
    SystemAdminController.insertSystemAdmin
);

router.delete(
    '/:system_admin_id',
    allowedRoles(['super admin']),
    SystemAdminController.deleteSystemAdmin
);

module.exports = router;