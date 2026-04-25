const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { canonicalizePatient } = require("../../utils/canonicalize");
const { uploadToIPFS } = require("../../utils/ipfs");
const { sha256Hex } = require("../../utils/hashUtil");
const { EthereumService } = require("../Blockchain/EthereumService");
const { PatientService } = require("./PatientService");

class PatientEthereumProofService {
  /**
   * Upload patient to IPFS AND anchor proof on blockchain (single operation)
   */
  static async anchorPatientProof(patient_id) {
    if (!patient_id) {
      throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
    }

    console.log(`[PatientEthereumProofService] Starting anchor process for patient: ${patient_id}`);

    // 1) Fetch patient from database
    const patient = await PatientService.getPatientIfExists(patient_id);
    if (!patient) {
      throw new AppError("Patient not found", STATUS_CODES.NOT_FOUND);
    }

    try {
      // 2) Check if proof already exists on blockchain
      const proofExists = await EthereumService.proofExists(String(patient_id));
      
      if (proofExists) {
        console.log(`[PatientEthereumProofService] Proof already exists for patient: ${patient_id}`);
        
        // Fetch existing proof details
        const existingProof = await EthereumService.getProof(String(patient_id));
        
        // ✅ FIX: Validate timestamp before converting to ISO string
        let anchoredAt;
        try {
          // existingProof.timestamp should be in milliseconds
          if (existingProof.timestamp && existingProof.timestamp > 0) {
            anchoredAt = new Date(existingProof.timestamp).toISOString();
          } else {
            anchoredAt = "Unknown";
          }
        } catch (dateError) {
          console.warn("[PatientEthereumProofService] Invalid timestamp:", existingProof.timestamp);
          anchoredAt = "Invalid timestamp";
        }
        
        throw new AppError(
          "Patient data already anchored on blockchain",
          STATUS_CODES.CONFLICT,
          {
            errorType: "DUPLICATE_PROOF",
            existingProof: {
              ipfsCID: existingProof.ipfsCID || existingProof.cid,
              dataHash: existingProof.dataHash,
              anchoredAt,
              submitter: existingProof.submitter,
            },
            suggestion: "Use the existing proof or update the patient data first",
          }
        );
      }

      // 3) Canonical JSON
      console.log("[PatientEthereumProofService] Canonicalizing patient data...");
      const canonicalJSON = canonicalizePatient(patient);

      // 4) IPFS -> CID (single upload)
      console.log("[PatientEthereumProofService] Uploading to IPFS...");
      const cid = await uploadToIPFS(canonicalJSON);
      console.log("[PatientEthereumProofService] ✓ IPFS upload successful, CID:", cid);

      // 5) SHA-256 -> hex
      const dataHash = sha256Hex(canonicalJSON);
      console.log("[PatientEthereumProofService] Data hash:", dataHash);

      // 6) Send tx to blockchain
      console.log("[PatientEthereumProofService] Anchoring proof on blockchain...");
      const { txHash, proofId, explorerUrl, blockNumber, gasUsed } = await EthereumService.recordPatientProof(
        String(patient_id),
        cid,
        dataHash
      );

      console.log("[PatientEthereumProofService] ✓ Proof anchored successfully");
      console.log("[PatientEthereumProofService] Transaction hash:", txHash);

      return {
        patient_id,
        cid,
        dataHash,
        proofId,
        txHash,
        blockNumber,
        gasUsed,
        explorerUrl,
        ipfsGatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        anchoredAt: new Date().toISOString(),
      };
    } catch (error) {
      // Re-throw AppError as-is (preserves status code and details)
      if (error instanceof AppError) {
        throw error;
      }

      // Wrap unexpected errors
      console.error("[PatientEthereumProofService] Unexpected error:", error);
      throw new AppError(
        "Failed to anchor patient proof",
        STATUS_CODES.INTERNAL_SERVER_ERROR,
        {
          originalError: process.env.NODE_ENV === "development" ? error.message : undefined,
        }
      );
    }
  }
}

module.exports = { PatientEthereumProofService };