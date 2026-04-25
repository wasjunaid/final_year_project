const express = require("express");
const HospitalStaffController = require("../../controllers/Hospital/HospitalStaffController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK,
        roles.HOSPITAL_LAB_TECHNICIAN,
        roles.HOSPITAL_PHARMACIST
    ]),
    HospitalStaffController.getHospitalStaffIfExists
);

router.get(
    '/all',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalStaffController.getAllHospitalStaffIfExists
);

router.get(
    '/admin',
    allowedRoles([
        roles.SUPER_ADMIN
    ]),
    HospitalStaffController.getAllHospitalAdminsIfExists
);

router.post(
    '/',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalStaffController.insertHospitalStaff
);

router.delete(
    '/:hospital_staff_id',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalStaffController.deleteHospitalStaff
);

router.put(
    '/:hospital_staff_id/status',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalStaffController.updateHospitalStaffStatus
);

module.exports = router;