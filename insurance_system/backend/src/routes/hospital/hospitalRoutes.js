const express = require("express");
const HospitalController = require("../../controllers/Hospital/HospitalController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../utils/validConstantsUtil");
const { verifyAccessJWT } = require("../../middlewares/verifyAccessJWTMiddleware");
const { INTERSYSTEM_SYNC_SECRET } = require("../../config/projectBackendConfig");

const router = express.Router();

const internalSyncOnly = (req, res, next) => {
    const providedSecret = req.headers["x-sync-secret"];
    if (providedSecret !== INTERSYSTEM_SYNC_SECRET) {
        return res.status(403).json({
            data: null,
            message: "Forbidden",
            status: 403,
            success: false,
        });
    }

    return next();
};

router.get(
    "/",
    verifyAccessJWT,
    allowedRoles([roles.SUPER_ADMIN, roles.INSURANCE_ADMIN, roles.INSURANCE_SUB_ADMIN]),
    HospitalController.getHospitalsIfExists
);

router.post(
    "/",
    internalSyncOnly,
    HospitalController.insertHospital
);

router.put(
    "/:hospital_id",
    internalSyncOnly,
    HospitalController.updateHospital
);

router.delete(
    "/:hospital_id",
    internalSyncOnly,
    HospitalController.deleteHospital
);

module.exports = router;