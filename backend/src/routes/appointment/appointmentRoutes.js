const express = require("express");
const AppointmentController = require("../../controllers/Appointment/AppointmentController");

const router = express.Router();

router.get(
    "/appointment-details/:appointment_id",
    AppointmentController.getAppointmentDetails
)

router.get(
    "/patient",
    AppointmentController.getAppointmentsForPatient
);

router.get(
    "/doctor",
    AppointmentController.getAppointmentsForDoctor
);

router.get(
    "/hospital",
    AppointmentController.getAppointmentsForHospital
);

router.put(
    "/:appointment_id",
    AppointmentController.updateAppointmentStatus
);

module.exports = router;