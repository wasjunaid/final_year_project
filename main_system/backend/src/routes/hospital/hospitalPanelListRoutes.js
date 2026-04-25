const express = require("express");
const HospitalPanelListController = require("../../controllers/Hospital/HospitalPanelListController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalPanelListController.getHospitalPanelListIfExists
);

router.post(
    '/',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalPanelListController.insertHospitalPanelList
);

router.delete(
    '/:hospital_panel_list_id',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN
    ]),
    HospitalPanelListController.deleteHospitalPanelList
);

module.exports = router;