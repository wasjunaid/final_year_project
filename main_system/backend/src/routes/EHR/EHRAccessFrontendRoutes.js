const express = require("express");
const EHRAccessFrontendController = require("../../controllers/EHR/EHRAccessFrontendController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

/**
 * GET /ehr-access/frontend/patient
 * Get all EHR access requests for the authenticated patient
 * Returns AccessRequestDto[] format with doctor details
 */
router.get(
    "/patient",
    allowedRoles([
        roles.PATIENT
    ]),
    EHRAccessFrontendController.getAllEHRAccessForPatientIfExists
);

/**
 * GET /ehr-access/frontend/doctor
 * Get all EHR access requests for the authenticated doctor
 * Returns AccessRequestDto[] format with patient details
 */
router.get(
    "/doctor",
    allowedRoles([
        roles.DOCTOR
    ]),
    EHRAccessFrontendController.getAllEHRAccessForDoctorIfExists
);

module.exports = router;
