const express = require("express");
const PatientFamilyHistoryController = require("../../controllers/Patient/PatientFamilyHistoryController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientFamilyHistoryController.getPatientFamilyHistoryIfExistsForPatient
);

router.get(
    '/doctor/:person_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientFamilyHistoryController.getPatientFamilyHistoryIfExistsForDoctor
);

router.put(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientFamilyHistoryController.insertPatientFamilyHistoryIfNotExistsForPatient
);

router.put(
    '/doctor/:patient_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientFamilyHistoryController.insertPatientFamilyHistoryIfNotExistsForDoctor
);

module.exports = router;