const express = require("express");
const DoctorNoteController = require("../../controllers/Doctor/DoctorNoteController");

const router = express.Router();

router.get(
    '/:appointment_id',
    DoctorNoteController.getDoctorNoteAgainstAppointment
);

router.post(
    '/',
    DoctorNoteController.insertDoctorNote
);

module.exports = router;