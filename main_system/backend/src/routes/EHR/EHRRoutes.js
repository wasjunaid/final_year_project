const express = require("express");
const EHRController = require("../../controllers/EHR/EHRController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/appointment",
    allowedRoles([roles.DOCTOR]),
    EHRController.getEHRAgainstAppointment
);

router.get(
    "/doctor",
    allowedRoles([roles.DOCTOR]),
    EHRController.getEHRForDoctor
);

module.exports = router;