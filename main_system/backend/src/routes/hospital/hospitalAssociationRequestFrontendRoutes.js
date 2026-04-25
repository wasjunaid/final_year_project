const express = require("express");
const HospitalAssociationRequestFrontendController = require("../../controllers/Hospital/HospitalAssociationRequestFrontendController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

/**
 * GET /hospital-association-request/frontend/person
 * Get all association requests for the authenticated person (doctor/medical coder)
 * Returns PersonAssociationRequestDto[] format with hospital_name
 */
router.get(
    "/person",
    allowedRoles([
        roles.DOCTOR,
        roles.MEDICAL_CODER
    ]),
    HospitalAssociationRequestFrontendController.getHospitalAssociationRequestsForPersonIfExists
);

/**
 * GET /hospital-association-request/frontend/hospital-staff
 * Get all association requests for the authenticated hospital staff member
 * Returns HospitalAssociationRequestDto[] format with person details
 */
router.get(
    "/hospital-staff",
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalAssociationRequestFrontendController.getHospitalAssociationRequestsForHospitalStaffIfExists
);

module.exports = router;
