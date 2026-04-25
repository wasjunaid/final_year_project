const express = require("express");

const vm = require("../../middlewares/verifyAccessJWTMiddleware");
const verifyAccessJWT = vm.verifyAccessJWT || vm.default || vm;

const am = require("../../middlewares/allowedRolesMiddleware");
const allowedRoles = am.allowedRoles || am.default || am;

const PatientIPFSController = require("../../controllers/Patient/PatientIPFSController");

const validConstants = require("../../validations/auth/authValidations");
const roles = validConstants.VALID_ROLES_OBJECT || validConstants.VALID_ROLES || validConstants;

if (typeof verifyAccessJWT !== "function") throw new Error("verifyAccessJWT not a function");
if (typeof allowedRoles !== "function") throw new Error("allowedRoles not a function");
if (!roles || typeof roles.PATIENT === "undefined") throw new Error("roles.PATIENT undefined");
if (!PatientIPFSController || typeof PatientIPFSController.uploadSelfToIPFS !== "function") {
  throw new Error("PatientIPFSController.uploadSelfToIPFS not a function");
}

const router = express.Router();

router.post(
  "/upload",
  allowedRoles([roles.PATIENT]),
  (req, res) => PatientIPFSController.uploadSelfToIPFS(req, res)
);

module.exports = router;  // <-- ensure this exports the router, not an object