const express = require("express");
const PatientController = require("../../controllers/Patient/PatientController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientController.getPatientIfExists
);

router.put(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientController.updatePatient
);

module.exports = router;