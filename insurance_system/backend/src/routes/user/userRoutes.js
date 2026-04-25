const express = require("express");
const UserController = require("../../controllers/User/UserController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([roles.SUPER_ADMIN]),
    UserController.getUsersIfExists
);

router.delete(
    "/:user_id",
    allowedRoles([roles.SUPER_ADMIN]),
    UserController.deleteUser
);

module.exports = router;