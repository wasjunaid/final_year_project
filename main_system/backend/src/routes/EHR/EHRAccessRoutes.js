const express = require("express");
const EHRAccessController = require("../../controllers/EHR/EHRAccessController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/patient",
    allowedRoles([
        roles.PATIENT
    ]),
    EHRAccessController.getAllEHRAccessForPatientIfExists
);

router.get(
    "/doctor",
    allowedRoles([
        roles.DOCTOR
    ]),
    EHRAccessController.getAllEHRAccessForDoctorIfExists
);

router.put(
    "/request",
    allowedRoles([
        roles.DOCTOR
    ]),
    EHRAccessController.requestEHRAccess
);

router.put(
    "/deny/:ehr_access_id",
    allowedRoles([
        roles.PATIENT
    ]),
    EHRAccessController.denyEHRAccess
);

router.put(
    "/grant/:ehr_access_id",
    allowedRoles([
        roles.PATIENT
    ]),
    EHRAccessController.grantEHRAccess
);

router.put(
    "/revoke/:ehr_access_id",
    allowedRoles([
        roles.PATIENT
    ]),
    EHRAccessController.revokeEHRAccess
);

router.post(
    "/patient-data",
    allowedRoles([
        roles.DOCTOR
    ]),
    EHRAccessController.getPatientEHRDataForDoctor
);

router.get(
    "/history_from_blockchain",
    allowedRoles([
        roles.PATIENT,
        roles.SUPER_ADMIN,
        roles.ADMIN
    ]),
    EHRAccessController.getAccessHistoryFromBlockchain
);

module.exports = router;