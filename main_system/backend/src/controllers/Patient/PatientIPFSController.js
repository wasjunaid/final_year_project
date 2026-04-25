const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const PatientIPFSService = require("../../services/Patient/PatientIPFSService");

class PatientIPFSController {
  async uploadSelfToIPFS(req, res) {
    try {
      // Prefer the authenticated user’s id; fallback to body.patient_id for admin/use-cases
      const patient_id = req.user?.person_id || req.body?.patient_id;
      const result = await PatientIPFSService.uploadCanonicalPatientToIPFS(patient_id);

      return res.status(STATUS_CODES.OK).json({
        data: result,
        message: "Canonical patient uploaded to IPFS",
        status: STATUS_CODES.OK,
        success: true,
      });
    } catch (error) {
      return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        data: null,
        message: error.message || "Unable to upload to IPFS",
        status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
        success: false,
      });
    }
  }
}

module.exports = new PatientIPFSController();