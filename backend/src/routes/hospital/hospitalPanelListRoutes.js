const express = require("express");
const HospitalPanelListController = require("../../controllers/Hospital/HospitalPanelListController");

const router = express.Router();

router.get(
    '/',
    HospitalPanelListController.getHospitalPanelList
);

router.post(
    '/',
    HospitalPanelListController.insertHospitalPanelList
);

router.delete(
    '/:hospital_panel_list_id',
    HospitalPanelListController.deleteHospitalPanelList
);

module.exports = router;