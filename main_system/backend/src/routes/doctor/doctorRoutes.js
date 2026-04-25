const express = require("express");
const DoctorController = require("../../controllers/Doctor/DoctorController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.DOCTOR
    ]),
    DoctorController.getDoctorIfExists
);

router.get(
    '/hospital',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK
    ]),
    DoctorController.getAllDoctorsAssociatedWithHospitalIfExists
);

router.get(
    '/appointment-booking',
    allowedRoles([
        roles.PATIENT,
        roles.HOSPITAL_FRONT_DESK,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_ADMIN
    ]),
    DoctorController.getAllDoctorsForAppointmentBookingIfExists
);

router.put(
    '/',
    allowedRoles([
        roles.DOCTOR
    ]),
    DoctorController.updateDoctor
);

router.put(
    '/status/:doctor_id',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK
    ]),
    DoctorController.updateDoctorStatus
);

router.put(
    '/update-hospital',
    allowedRoles([
        roles.DOCTOR
    ]),
    DoctorController.updateDoctorHospitalAssociationForDoctor
);

router.put(
    '/remove-hospital/:doctor_id',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    DoctorController.updateDoctorHospitalAssociationForHospital
);

module.exports = router;