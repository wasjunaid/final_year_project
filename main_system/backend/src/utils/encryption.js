const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.IPFS_ENCRYPTION_KEY; // Must be 32 bytes (64 hex chars)

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('IPFS_ENCRYPTION_KEY must be set in .env (64 hex characters)');
}

/**
 * Encrypts an IPFS CID
 * @param {string} cid - IPFS CID to encrypt
 * @returns {string} Encrypted CID in format: iv:authTag:encryptedData
 */
function encryptCID(cid) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        ALGORITHM, 
        Buffer.from(ENCRYPTION_KEY, 'hex'), 
        iv
    );
    
    let encrypted = cipher.update(cid, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an IPFS CID
 * @param {string} encryptedCID - Encrypted CID in format: iv:authTag:encryptedData
 * @returns {string} Original IPFS CID
 */
function decryptCID(encryptedCID) {
    const parts = encryptedCID.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted CID format');
    }
    
    const [ivHex, authTagHex, encryptedData] = parts;
    
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

module.exports = { encryptCID, decryptCID };