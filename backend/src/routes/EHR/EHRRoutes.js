const express = require("express");
const EHRController = require("../../controllers/EHR/EHRController");

const router = express.Router();

router.get(
    "/appointment",
    EHRController.getEHRAgainstAppointment
);

router.get(
    "/doctor",
    EHRController.getEHRForDoctor
);

module.exports = router;