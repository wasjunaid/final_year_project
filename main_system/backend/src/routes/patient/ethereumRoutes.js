const express = require("express");
const PatientEthereumProofController = require("../../controllers/Patient/PatientEthereumProofController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

router.post(
  "/anchor",
  allowedRoles([roles.PATIENT]),
  (req, res) => PatientEthereumProofController.anchor(req, res)
);

module.exports = router;