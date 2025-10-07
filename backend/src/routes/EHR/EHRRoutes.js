const express = require("express");
const EHRController = require("../../controllers/EHR/EHRController");

const router = express.Router();

router.post(
    "/appointment",
    EHRController.getEHRAgainstAppointment
);

router.post(
    "/doctor",
    EHRController.getEHRForDoctor
);

module.exports = router;