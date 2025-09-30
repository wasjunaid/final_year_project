const express = require("express");
const HospitalStaffController = require("../../controllers/Hospital/HospitalStaffController");

const router = express.Router();

router.get(
    '/',
    HospitalStaffController.getHospitalStaff
);

router.get(
    '/:hospital_id',
    HospitalStaffController.getAllHospitalStaff
);

router.get(
    '/super-admin/all-hospital-admins',
    HospitalStaffController.getAllHospitalAdminsForSuperAdmin
);

router.post(
    '/',
    HospitalStaffController.insertHospitalStaff
);

router.delete(
    '/:hospital_staff_id',
    HospitalStaffController.deleteHospitalStaff
);

module.exports = router;