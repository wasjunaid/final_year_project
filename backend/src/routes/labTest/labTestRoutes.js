const express = require("express");
const LabTestController = require("../../controllers/LabTest/LabTestController");

const router = express.Router();

router.get(
    '/',
    LabTestController.getLabTests
);

router.post(
    '/',
    LabTestController.insertLabTest
);

router.put(
    '/:lab_test_id',
    LabTestController.updateLabTest
);

module.exports = router;