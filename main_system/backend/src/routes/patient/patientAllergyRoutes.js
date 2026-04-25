const express = require("express");
const PatientAllergyController = require("../../controllers/Patient/PatientAllergyController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientAllergyController.getPatientAllergiesIfExistsForPatient
);

router.get(
    '/doctor/:person_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientAllergyController.getPatientAllergiesIfExistsForDoctor
);

router.put(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientAllergyController.insertPatientAllergyIfNotExistsForPatient
);

router.put(
    '/doctor/:patient_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientAllergyController.insertPatientAllergyIfNotExistsForDoctor
);

module.exports = router;