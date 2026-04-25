const axios = require("axios");
const FormData = require("form-data");

/**
 * Uploads content to IPFS via Pinata and returns the CID string.
 * Uses Pinata API v2 (latest as of 2024-2025)
 * @param {string|Buffer|Object} input - if object, will be JSON.stringified
 * @returns {Promise<string>} CID of the uploaded content
 */
async function uploadToIPFS(input) {
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_SECRET_API_KEY;
  const jwt = process.env.PINATA_JWT;

  if (!apiKey && !jwt) {
    throw new Error(
      "IPFS credentials missing. Set PINATA_API_KEY and PINATA_SECRET_API_KEY (or PINATA_JWT) in .env"
    );
  }

  console.log("[IPFS] Uploading to Pinata...");
  console.log("[IPFS] Input type:", typeof input);

  try {
    let response;

    // Always parse JSON strings back to objects for pinJSONToIPFS
    let dataToUpload;
    
    if (typeof input === "string") {
      // If it's a JSON string (from canonicalize), parse it first
      try {
        dataToUpload = JSON.parse(input);
      } catch (e) {
        // If not valid JSON, treat as plain text and wrap it
        dataToUpload = { content: input };
      }
    } else if (Buffer.isBuffer(input)) {
      // Binary data - use pinFileToIPFS instead
      return await uploadBinaryToIPFS(input, apiKey, apiSecret);
    } else {
      // Already an object
      dataToUpload = input;
    }

    // Use pinJSONToIPFS endpoint for JSON content
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

    const options = {
      pinataMetadata: {
        name: `healthcare-${Date.now()}.json`,
        keyvalues: {
          uploadedBy: "healthcare-backend",
          timestamp: new Date().toISOString(),
        },
      },
      pinataOptions: {
        cidVersion: 1, // Use CIDv1 for better compatibility
      },
    };

    console.log("[IPFS] Uploading data:", JSON.stringify(dataToUpload, null, 2).substring(0, 200) + "...");

    response = await axios.post(
      url,
      {
        pinataContent: dataToUpload,
        ...options,
      },
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
      }
    );

    const cid = response.data.IpfsHash;
    const pinSize = response.data.PinSize;
    const timestamp = response.data.Timestamp;

    console.log("[IPFS] ✓ Upload successful");
    console.log("[IPFS] CID:", cid);
    console.log("[IPFS] Size:", pinSize, "bytes");
    console.log("[IPFS] Pinned at:", new Date(timestamp).toISOString());

    const gatewayUrl = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud";
    console.log("[IPFS] View at:", `${gatewayUrl}/ipfs/${cid}`);

    return cid;
  } catch (error) {
    console.error("[IPFS] ✗ Upload failed:", error.response?.data || error.message);
    throw new Error(`IPFS upload failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Helper function for binary uploads
 * @param {Buffer} buffer - File buffer
 * @param {string} apiKey - Pinata API key
 * @param {string} apiSecret - Pinata secret API key
 * @returns {Promise<string>} IPFS CID
 */
async function uploadBinaryToIPFS(buffer, apiKey, apiSecret) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  
  const formData = new FormData();
  formData.append("file", buffer, {
    filename: `healthcare-${Date.now()}.bin`,
  });

  const metadata = JSON.stringify({
    name: `healthcare-${Date.now()}.bin`,
    keyvalues: {
      uploadedBy: "healthcare-backend",
      timestamp: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", options);

  const response = await axios.post(url, formData, {
    maxBodyLength: Infinity,
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    },
  });

  console.log("[IPFS] Binary upload successful - CID:", response.data.IpfsHash);
  return response.data.IpfsHash;
}

/**
 * Uploads a medical document to IPFS with healthcare-specific metadata
 * @param {Buffer} fileBuffer - File content as Buffer
 * @param {Object} metadata - Document metadata
 * @param {string} metadata.originalName - Original filename
 * @param {string} metadata.mimeType - MIME type
 * @param {string} metadata.documentType - Type from VALID_UNVERIFIED_DOCUMENT_TYPES
 * @param {string} metadata.patientId - Patient UUID
 * @param {string} [metadata.appointmentId] - Appointment UUID (for verified docs)
 * @param {string} [metadata.labTestId] - Lab test ID (for verified docs)
 * @param {boolean} [metadata.isVerified] - Whether verified by staff
 * @param {string} [metadata.uploadedBy] - Person ID of uploader (for verified docs)
 * @returns {Promise<{ipfsHash: string, pinSize: number}>} IPFS CID and file size
 */
async function uploadMedicalDocument(fileBuffer, metadata) {
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_SECRET_API_KEY;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "IPFS credentials missing. Set PINATA_API_KEY and PINATA_SECRET_API_KEY in .env"
    );
  }

  if (!Buffer.isBuffer(fileBuffer)) {
    throw new Error("fileBuffer must be a Buffer");
  }

  if (!metadata.originalName || !metadata.mimeType || !metadata.patientId) {
    throw new Error("Missing required metadata: originalName, mimeType, patientId");
  }

  console.log(`[IPFS] Uploading medical document: ${metadata.originalName}`);
  console.log(`[IPFS] Patient: ${metadata.patientId}, Type: ${metadata.documentType || 'N/A'}`);
  console.log(`[IPFS] Size: ${fileBuffer.length} bytes, MIME: ${metadata.mimeType}`);

  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  
  const formData = new FormData();
  
  // Extract file extension from original name
  const extension = metadata.originalName.split('.').pop() || 'bin';
  const filename = `${metadata.patientId}-${Date.now()}.${extension}`;
  
  formData.append("file", fileBuffer, {
    filename: filename,
    contentType: metadata.mimeType,
  });

  // Add comprehensive metadata
  const pinataMetadata = JSON.stringify({
    name: metadata.originalName,
     keyvalues: {
      // Essential searchable fields only (8 keys total)
      service: "healthcare-backend",           // 1
      timestamp: new Date().toISOString(),     // 2
      patientId: String(metadata.patientId),   // 3 - Most important for queries
      docType: metadata.documentType || "N/A", // 4
      isVerified: metadata.isVerified ? "true" : "false", // 5
      mimeType: metadata.mimeType,             // 6
      fileSize: String(fileBuffer.length),     // 7
      // Optional fields (only if provided)
      ...(metadata.appointmentId && { appointmentId: String(metadata.appointmentId) }), // 8 (conditional)
      // Removed: uploadedByPersonId, labTestId, originalName (stored in DB)
    },
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append("pinataOptions", pinataOptions);

  try {
    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    const ipfsHash = response.data.IpfsHash;
    const pinSize = response.data.PinSize;

    console.log("[IPFS] ✓ Medical document uploaded successfully");
    console.log("[IPFS] CID:", ipfsHash);
    console.log("[IPFS] Pin Size:", pinSize, "bytes");

    const gatewayUrl = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud";
    console.log("[IPFS] Access at:", `${gatewayUrl}/ipfs/${ipfsHash}`);

    return {
      ipfsHash,
      pinSize,
    };
  } catch (error) {
    console.error("[IPFS] ✗ Medical document upload failed:", error.response?.data || error.message);
    throw new Error(`IPFS medical document upload failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Retrieves content from IPFS via Pinata gateway by CID.
 * @param {string} cid - Content identifier
 * @returns {Promise<string>} Content as string
 */
async function getFromIPFS(cid) {
  const gatewayUrl = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud";
  const url = `${gatewayUrl}/ipfs/${cid}`;

  console.log("[IPFS] Fetching content for CID:", cid);

  try {
    const response = await axios.get(url, {
      timeout: 30000, // 30 second timeout
    });

    console.log("[IPFS] ✓ Fetch successful");

    // Return as string (works for JSON and text)
    return typeof response.data === "object"
      ? JSON.stringify(response.data, null, 2)
      : String(response.data);
  } catch (error) {
    console.error("[IPFS] ✗ Fetch failed:", error.message);
    throw new Error(`IPFS fetch failed: ${error.message}`);
  }
}

/**
 * Retrieves binary content from IPFS (for files like PDFs, images)
 * @param {string} cid - Content identifier
 * @returns {Promise<Buffer>} File content as Buffer
 */
async function getBinaryFromIPFS(cid) {
  const gatewayUrl = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud";
  const url = `${gatewayUrl}/ipfs/${cid}`;

  console.log("[IPFS] Fetching binary content for CID:", cid);

  try {
    const response = await axios.get(url, {
      timeout: 30000, // 30 second timeout
      responseType: 'arraybuffer', // Important: get raw binary data
    });

    console.log("[IPFS] ✓ Binary fetch successful");
    console.log("[IPFS] Size:", response.data.byteLength, "bytes");

    return Buffer.from(response.data);
  } catch (error) {
    console.error("[IPFS] ✗ Binary fetch failed:", error.message);
    throw new Error(`IPFS binary fetch failed: ${error.message}`);
  }
}

/**
 * Lists all pinned files on Pinata (useful for admin/monitoring).
 * @returns {Promise<Array>} Array of pinned items
 */
async function listPinnedFiles() {
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_SECRET_API_KEY;
  const jwt = process.env.PINATA_JWT;

  if (!apiKey && !jwt) {
    throw new Error("IPFS credentials missing");
  }

  const url = "https://api.pinata.cloud/data/pinList";

  try {
    const response = await axios.get(url, {
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
      params: {
        status: "pinned",
        pageLimit: 100,
      },
    });

    return response.data.rows;
  } catch (error) {
    console.error("[IPFS] List failed:", error.response?.data || error.message);
    throw new Error(`Failed to list pinned files: ${error.message}`);
  }
}

/**
 * Unpins a file from Pinata (frees up storage).
 * @param {string} cid - Content identifier to unpin
 * @returns {Promise<void>}
 */
async function unpinFile(cid) {
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_SECRET_API_KEY;
  const jwt = process.env.PINATA_JWT;

  if (!apiKey && !jwt) {
    throw new Error("IPFS credentials missing");
  }

  const url = `https://api.pinata.cloud/pinning/unpin/${cid}`;

  try {
    await axios.delete(url, {
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    console.log("[IPFS] ✓ Unpinned CID:", cid);
  } catch (error) {
    console.error("[IPFS] Unpin failed:", error.response?.data || error.message);
    throw new Error(`Failed to unpin: ${error.message}`);
  }
}

module.exports = { 
  uploadToIPFS, 
  getFromIPFS, 
  getBinaryFromIPFS,
  uploadMedicalDocument, // NEW: Main function for document uploads
  listPinnedFiles, 
  unpinFile 
};
