const express = require("express");
const PatientMedicalHistoryController = require("../../controllers/Patient/PatientMedicalHistoryController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientMedicalHistoryController.getPatientMedicalHistoryIfExistsForPatient
);

router.get(
    '/doctor/:person_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientMedicalHistoryController.getPatientMedicalHistoryIfExistsForDoctor
);

router.put(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientMedicalHistoryController.insertPatientMedicalHistoryIfNotExistsForPatient
);

router.put(
    '/doctor/:patient_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientMedicalHistoryController.insertPatientMedicalHistoryIfNotExistsForDoctor
);

module.exports = router;