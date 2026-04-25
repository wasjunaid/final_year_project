const express = require("express");
const InsurancePanelListController = require("../../controllers/Insurance/InsurancePanelListController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");

const router = express.Router();

router.get(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsurancePanelListController.getInsurancePanelListIfExists
);

router.post(
    "/",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsurancePanelListController.insertInsurancePanelList
);

router.delete(
    "/:insurance_panel_list_id",
    allowedRoles([
        roles.INSURANCE_ADMIN,
        roles.INSURANCE_SUB_ADMIN
    ]),
    InsurancePanelListController.deleteInsurancePanelList
);

module.exports = router;