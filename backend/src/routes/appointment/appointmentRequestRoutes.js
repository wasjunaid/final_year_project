const express = require("express");
const AppointmentRequestController = require("../../controllers/Appointment/AppointmentRequestController");
    
const router = express.Router();

router.get(
    "/patient",
    AppointmentRequestController.getAppointmentRequestsForPatient
);

router.get(
    "/hospital",
    AppointmentRequestController.getAppointmentRequestsForHospital
);

router.post(
    "/",
    AppointmentRequestController.insertAppointmentRequest
);

router.put(
    "/hospital/:appointment_request_id",
    AppointmentRequestController.updateAppointmentRequestStatusForHospital
);

router.put(
    "/cancel/:appointment_request_id",
    AppointmentRequestController.cancelAppointmentRequest
);

router.put(
    "/reschedule/:appointment_request_id",
    AppointmentRequestController.rescheduleAppointmentRequest
);

module.exports = router;