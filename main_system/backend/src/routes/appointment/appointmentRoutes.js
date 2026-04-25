const express = require("express");
const AppointmentController = require("../../controllers/Appointment/AppointmentController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    "/patient",
    allowedRoles([
        roles.PATIENT
    ]),
    AppointmentController.getAppointmentsForPatientIfExists
)

router.get(
    "/doctor",
    allowedRoles([
        roles.DOCTOR
    ]),
    AppointmentController.getAppointmentsForDoctorIfExists
)

router.get(
    "/hospital",
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK
    ]),
    AppointmentController.getAppointmentsForHospitalStaffIfExists
)

router.post(
    "/",
    allowedRoles([
        roles.PATIENT
    ]),
    AppointmentController.insertAppointment
)

router.post(
    "/doctor-follow-up/:appointment_id",
    allowedRoles([
        roles.DOCTOR
    ]),
    AppointmentController.createFollowUpAppointmentForDoctor
)

router.post(
    "/patient-follow-up/:appointment_id",
    allowedRoles([
        roles.PATIENT
    ]),
    AppointmentController.createFollowUpAppointmentForPatient
)

router.put(
    "/approve/:appointment_id",
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK
    ]),
    AppointmentController.approveAppointment
)

router.put(
    "/deny/:appointment_id",
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK
    ]),
    AppointmentController.denyAppointment
)

router.put(
    "/cancel/:appointment_id",
    allowedRoles([
        roles.PATIENT
    ]),
    AppointmentController.cancelAppointment
)

router.put(
    "/patient-reschedule/:appointment_id",
    allowedRoles([
        roles.PATIENT
    ]),
    AppointmentController.rescheduleAppointmentForPatient
)

router.put(
    "/hospital-reschedule/:appointment_id",
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK
    ]),
    AppointmentController.rescheduleAppointmentForHospitalStaff
)

router.put(
    "/start/:appointment_id",
    allowedRoles([
        roles.DOCTOR
    ]),
    AppointmentController.startAppointment
)

router.put(
    "/hospitalize/:appointment_id",
    allowedRoles([
        roles.DOCTOR
    ]),
    AppointmentController.hospitalizeAppointment
)

router.put(
    "/discharge/:appointment_id",
    allowedRoles([
        roles.DOCTOR
    ]),
    AppointmentController.dischargeAppointment
)

router.put(
    "/order-lab-tests/:appointment_id",
    allowedRoles([
        roles.DOCTOR
    ]),
    AppointmentController.orderLabTests
)

router.put(
    "/complete-doctor/:appointment_id",
    allowedRoles([
        roles.DOCTOR
    ]),
    AppointmentController.completeAppointmentForDoctor
)

router.put(
    "/complete-lab-tests/:appointment_id",
    allowedRoles([
        roles.PATIENT
    ]),
    AppointmentController.completeLabTests
)

module.exports = router;