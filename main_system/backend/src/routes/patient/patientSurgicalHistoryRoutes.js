const express = require("express");
const PatientSurgicalHistoryController = require("../../controllers/Patient/PatientSurgicalHistoryController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientSurgicalHistoryController.getPatientSurgicalHistoryIfExistsForPatient
);

router.get(
    '/doctor/:person_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientSurgicalHistoryController.getPatientSurgicalHistoryIfExistsForDoctor
);

router.put(
    '/',
    allowedRoles([
        roles.PATIENT
    ]),
    PatientSurgicalHistoryController.insertPatientSurgicalHistoryIfNotExistsForPatient
);

router.put(
    '/doctor/:patient_id',
    allowedRoles([
        roles.DOCTOR
    ]),
    PatientSurgicalHistoryController.insertPatientSurgicalHistoryIfNotExistsForDoctor
);

module.exports = router;