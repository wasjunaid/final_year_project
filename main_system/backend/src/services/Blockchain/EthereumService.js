const { ethers } = require("ethers");
const path = require("path");
const ethCfg = require("../../config/ethereumConfig");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");

let provider, wallet, contract;

function ensureContract() {
  if (!ethCfg.rpcUrl || !ethCfg.backendPrivateKey || !ethCfg.contractAddress) {
    throw new AppError("Ethereum config missing", STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
  if (!provider) {
    provider = new ethers.JsonRpcProvider(ethCfg.rpcUrl, ethCfg.chainId);
    wallet = new ethers.Wallet(ethCfg.backendPrivateKey, provider);
    const artifact = require(path.join(
      process.cwd(),
      "blockchain",
      "artifacts",
      "contracts",
      "EHRProof.sol",
      "EHRProof.json"
    ));
    contract = new ethers.Contract(ethCfg.contractAddress, artifact.abi, wallet);
  }
  return contract;
}

function toBytes32(hexLike) {
  const no0x = (hexLike || "").replace(/^0x/, "");
  const padded = ethers.zeroPadValue("0x" + no0x, 32);
  return ethers.hexlify(padded);
}

/**
 * Parse blockchain error and return user-friendly message
 */
function parseBlockchainError(error) {
  console.error("[Ethereum] Error details:", {
    code: error.code,
    reason: error.reason,
    action: error.action,
    message: error.message,
  });

  // Check for common error codes
  if (error.code === "CALL_EXCEPTION") {
    // Contract reverted with a reason
    if (error.reason) {
      // Common contract errors
      if (error.reason.includes("Proof exists")) {
        return {
          userMessage: "This patient's data has already been anchored on the blockchain",
          errorType: "DUPLICATE_PROOF",
          statusCode: STATUS_CODES.CONFLICT, // 409
          details: "A proof for this patient already exists on-chain",
        };
      }
      
      if (error.reason.includes("Unauthorized")) {
        return {
          userMessage: "Unauthorized to perform this blockchain operation",
          errorType: "UNAUTHORIZED",
          statusCode: STATUS_CODES.FORBIDDEN,
          details: error.reason,
        };
      }

      // Generic contract revert
      return {
        userMessage: `Smart contract error: ${error.reason}`,
        errorType: "CONTRACT_REVERT",
        statusCode: STATUS_CODES.BAD_REQUEST,
        details: error.reason,
      };
    }
  }

  // Network/connection errors
  if (error.code === "NETWORK_ERROR" || error.code === "TIMEOUT") {
    return {
      userMessage: "Failed to connect to blockchain network. Please try again later.",
      errorType: "NETWORK_ERROR",
      statusCode: STATUS_CODES.SERVICE_UNAVAILABLE, // 503
      details: "Blockchain network is unreachable",
    };
  }

  // Insufficient funds
  if (error.code === "INSUFFICIENT_FUNDS") {
    return {
      userMessage: "Insufficient funds in backend wallet for gas fees",
      errorType: "INSUFFICIENT_FUNDS",
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      details: "Backend wallet needs more ETH for gas",
    };
  }

  // Nonce errors
  if (error.code === "NONCE_EXPIRED" || error.code === "REPLACEMENT_UNDERPRICED") {
    return {
      userMessage: "Transaction conflict. Please try again.",
      errorType: "NONCE_ERROR",
      statusCode: STATUS_CODES.CONFLICT,
      details: "Nonce synchronization issue",
    };
  }

  // Generic error
  return {
    userMessage: "Failed to anchor proof on blockchain",
    errorType: "BLOCKCHAIN_ERROR",
    statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
    details: error.message || "Unknown blockchain error",
  };
}

class EthereumService {
  /**
   * Check if proof already exists for a patient
   */
  static async proofExists(patientId) {
    try {
      const c = ensureContract();
      const proof = await c.getProof(String(patientId));
      
      // Check if proof has been set (non-zero timestamp means proof exists)
      const timestamp = proof[2]; // uint256 timestamp
      return Number(timestamp) > 0;
    } catch (error) {
      console.error("[Ethereum] Error checking proof existence:", error.message);
      return false; // Assume doesn't exist if can't check
    }
  }

  /**
   * Get existing proof for a patient
   */
  static async getProof(patientId) {
    try {
      const c = ensureContract();
      
      console.log(`[Ethereum] Fetching proof for patient: ${patientId}`);
      
      const [exists, cid, dataHash, timestamp, submitter] = await c.getProof(String(patientId));
      
      console.log(`[Ethereum] getProof result:`, {
        exists,
        cid,
        dataHash,
        timestamp: timestamp.toString(),
        submitter
      });
      
      if (!exists) {
        throw new AppError(
          "No proof found for this patient",
          STATUS_CODES.NOT_FOUND
        );
      }
      
      // ✅ FIX: Convert BigInt to Number safely
      let timestampMs;
      try {
        // timestamp is a BigInt from Solidity uint256
        const timestampNum = Number(timestamp);
        
        // Blockchain timestamps are in seconds, convert to milliseconds
        timestampMs = timestampNum * 1000;
        
        // Validate it's a reasonable timestamp
        if (timestampMs <= 0 || timestampMs > Date.now() + 86400000) {
          console.warn(`[Ethereum] Suspicious timestamp: ${timestampMs}`);
          timestampMs = Date.now(); // Fallback to current time
        }
      } catch (conversionError) {
        console.error("[Ethereum] Timestamp conversion error:", conversionError);
        timestampMs = Date.now(); // Fallback
      }
      
      return {
        exists,
        ipfsCID: cid,
        cid, // Keep both for compatibility
        dataHash,
        timestamp: timestampMs,
        submitter,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error("[Ethereum] getProof error:", error);
      throw new AppError(
        "Failed to fetch proof from blockchain", 
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async recordPatientProof(patientId, cid, dataHashHex) {
    try {
      console.log("[Ethereum] Recording proof for patient:", patientId);
      console.log("[Ethereum] CID:", cid);
      console.log("[Ethereum] Data hash:", dataHashHex);

      const c = ensureContract();
      const hashBytes32 = toBytes32(dataHashHex);

      // Check if proof already exists before sending transaction
      const exists = await this.proofExists(patientId);
      if (exists) {
        console.log("[Ethereum] Proof already exists for patient:", patientId);
        
        // Get existing proof details
        const existingProof = await this.getProof(patientId);
        
        throw new AppError(
          "This patient's data has already been anchored on the blockchain",
          STATUS_CODES.CONFLICT,
          {
            errorType: "DUPLICATE_PROOF",
            existingProof: {
              ipfsCID: existingProof.ipfsCID,
              dataHash: existingProof.dataHash,
              anchoredAt: new Date(existingProof.timestamp).toISOString(),
            },
          }
        );
      }

      console.log("[Ethereum] Sending transaction...");
      const tx = await c.recordPatientProof(patientId, cid, hashBytes32);
      
      console.log("[Ethereum] Transaction sent:", tx.hash);
      console.log("[Ethereum] Waiting for confirmation...");
      
      const receipt = await tx.wait();
      
      console.log("[Ethereum] ✓ Transaction confirmed");
      console.log("[Ethereum] Block number:", receipt.blockNumber);
      console.log("[Ethereum] Gas used:", receipt.gasUsed.toString());

      const proofId = ethers.solidityPackedKeccak256(
        ["string", "string", "bytes32"],
        [patientId, cid, hashBytes32]
      );

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        proofId,
        explorerUrl: `${ethCfg.explorerTxBaseUrl}${receipt.hash}`,
      };
    } catch (err) {
      // Parse and throw user-friendly error
      const parsedError = parseBlockchainError(err);
      
      throw new AppError(
        parsedError.userMessage,
        parsedError.statusCode,
        {
          errorType: parsedError.errorType,
          details: parsedError.details,
          originalError: process.env.NODE_ENV === "development" ? err.message : undefined,
        }
      );
    }
  }
}

module.exports = { EthereumService };