const express = require("express");
const HospitalAssociationRequestController = require("../../controllers/Hospital/HospitalAssociationRequestController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/person",
    allowedRoles([
        roles.DOCTOR,
        roles.MEDICAL_CODER
    ]),
    HospitalAssociationRequestController.getHospitalAssociationRequestsForPersonIfExists
);

router.get(
    "/hospital-staff",
    // allowedRoles([
    //     roles.HOSPITAL_ADMIN,
    //     roles.HOSPITAL_SUB_ADMIN
    // ]),
    HospitalAssociationRequestController.getHospitalAssociationRequestsForHospitalStaffIfExists
);

router.post(
    "/",
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalAssociationRequestController.insertHospitalAssociationRequest
);

router.delete(
    "/hospital-staff/:hospital_association_request_id",
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalAssociationRequestController.deleteHospitalAssociationRequestForHospitalStaff
);

router.delete(
    "/person/:hospital_association_request_id",
    allowedRoles([
        roles.DOCTOR,
        roles.MEDICAL_CODER
    ]),
    HospitalAssociationRequestController.deleteHospitalAssociationRequestForPerson
);

router.delete(
    "/person",
    allowedRoles([
        roles.DOCTOR,
        roles.MEDICAL_CODER
    ]),
    HospitalAssociationRequestController.deleteAllHospitalAssociationRequestsForPerson
);

router.post(
    "/accept/:hospital_association_request_id",
    allowedRoles([
        roles.DOCTOR,
        roles.MEDICAL_CODER
    ]),
    HospitalAssociationRequestController.acceptHospitalAssociationRequest
);

module.exports = router;