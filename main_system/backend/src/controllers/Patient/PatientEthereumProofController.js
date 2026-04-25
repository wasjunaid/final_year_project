const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { PatientEthereumProofService } = require("../../services/Patient/PatientEthereumProofService");

class PatientEthereumProofController {
  async anchor(req, res) {
    try {
      const patient_id = req.user?.person_id || req.body?.patient_id;

      if (!patient_id) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          data: null,
          message: "Patient ID is required",
          status: STATUS_CODES.BAD_REQUEST,
          success: false,
        });
      }

      const result = await PatientEthereumProofService.anchorPatientProof(patient_id);

      return res.status(STATUS_CODES.OK).json({
        data: result,
        message: "Patient proof anchored on Ethereum successfully",
        status: STATUS_CODES.OK,
        success: true,
      });
    } catch (error) {
      console.error("[PatientEthereumProofController] Error:", error);

      // Handle AppError with custom status codes
      if (error instanceof AppError) {
        // ✅ FIX: Handle both statusCode and status properties
        const httpStatus = error.statusCode || error.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
        
        return res.status(httpStatus).json({
          data: error.data || null,
          message: error.message,
          status: httpStatus,
          success: false,
          errorType: error.data?.errorType,
          ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
            details: error.data,
          }),
        });
      }

      // Handle unexpected errors
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        data: null,
        message: "An unexpected error occurred while anchoring proof",
        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
        success: false,
        ...(process.env.NODE_ENV === "development" && {
          error: error.message,
          stack: error.stack,
        }),
      });
    }
  }
}

module.exports = new PatientEthereumProofController();