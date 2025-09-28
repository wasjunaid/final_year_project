const express = require("express");
const EHRAccessRequestController = require("../../controllers/EHR/EHRAccessRequestController");

const router = express.Router();

router.get(
    "/:patient_id",
    EHRAccessRequestController.getEHRAccessRequest
);

router.get(
    "/patient/requests",
    EHRAccessRequestController.getEHRAccessRequestsForPatient
);

router.get(
    "/doctor/requests",
    EHRAccessRequestController.getEHRAccessRequestsForDoctor
);

router.post(
    "/:patient_id",
    EHRAccessRequestController.insertEHRAccessRequest
);

router.put(
    "/approve/:ehr_access_request_id",
    EHRAccessRequestController.approveEHRAccessRequest
);

router.put(
    "/deny/:ehr_access_request_id",
    EHRAccessRequestController.denyEHRAccessRequest
);

router.put(
    "/revoke/:ehr_access_request_id",
    EHRAccessRequestController.revokeEHRAccessRequest
);

module.exports = router;