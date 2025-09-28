const crypto = require("crypto");

const tokenTypes = [
  'email_verification_token',
  'password_reset_token'
];

const generateTokenDataUtil = (tokenType) => {
  if (!tokenTypes.includes(tokenType)) {
    throw new Error("Invalid token type");
  }

  try {
    const tokenData = {
      token: crypto.randomBytes(32).toString('hex'),
      expires_at: new Date(Date.now() + (
        tokenType === 'email_verification_token'
        ? 24 * 60 * 60 * 1000 // 24 hours
        : 60 * 60 * 1000 // 1 hour
      ))
    };

    return tokenData;
  } catch (error) {
    throw new Error(`Failed to generate token data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

module.exports = { generateTokenDataUtil, tokenTypes };