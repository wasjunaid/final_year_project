const express = require("express");
const SystemAdminController = require("../../controllers/System/SystemAdminController");
const { BlacklistController } = require("../../controllers/System/BlacklistController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

// System Admin routes
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

// Blacklist routes
router.post(
    '/blacklist/initialize',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.ADMIN
    ]),
    (req, res) => new BlacklistController().initializeBlacklist(req, res)
);

router.get(
    '/blacklist',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.ADMIN
    ]),
    (req, res) => new BlacklistController().getBlacklist(req, res)
);

router.get(
    '/blacklist/check/:person_id',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.ADMIN,
        roles.PATIENT,
        roles.DOCTOR
    ]),
    (req, res) => new BlacklistController().checkIfBlacklisted(req, res)
);

router.post(
    '/blacklist/add',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.ADMIN
    ]),
    (req, res) => new BlacklistController().addToBlacklist(req, res)
);

router.delete(
    '/blacklist/remove/:person_id',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.ADMIN
    ]),
    (req, res) => new BlacklistController().removeFromBlacklist(req, res)
);

router.delete(
    '/blacklist/clear',
    allowedRoles([
        roles.SUPER_ADMIN
    ]),
    (req, res) => new BlacklistController().clearBlacklist(req, res)
);

module.exports = router;