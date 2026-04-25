const express = require("express");
const PersonController = require("../../controllers/Person/PersonController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    PersonController.getPersonsIfExists
);

router.post(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    PersonController.insertPersonIfNotExists
);

module.exports = router;