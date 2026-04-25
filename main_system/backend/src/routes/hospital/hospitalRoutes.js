const express = require("express");
const HospitalController = require("../../controllers/Hospital/HospitalController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.get(
    '/get/:hospital_id',
    // allowedRoles([
    //     roles.SUPER_ADMIN,
    //     roles.HOSPITAL_ADMIN,
    //     roles.HOSPITAL_SUB_ADMIN,
    //     roles.HOSPITAL_FRONT_DESK
    // ]),
    HospitalController.getHospitalIfExists
);

router.get(
    '/',
    // allowedRoles([
    //     roles.SUPER_ADMIN
    // ]),
    HospitalController.getAllHospitalsIfExists
);

router.get(
    '/associated-staff',
    allowedRoles([
        roles.HOSPITAL_ADMIN,
        roles.HOSPITAL_SUB_ADMIN,
        roles.HOSPITAL_FRONT_DESK
    ]),
    HospitalController.getAssociatedStaff
);

router.post(
    '/',
    allowedRoles([
        roles.SUPER_ADMIN
    ]),
    HospitalController.insertHospital
);

router.put(
    '/:hospital_id',
    allowedRoles([
        roles.SUPER_ADMIN,
        roles.HOSPITAL_ADMIN
    ]),
    HospitalController.updateHospital
);

module.exports = router;