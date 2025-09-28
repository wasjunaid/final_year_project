const bcrypt = require("bcrypt");

const verifyPasswordUtil = async (password, passwordHash) => {
    if (!password) {
      throw new Error("password is required");
    }
    if (!passwordHash) {
      throw new Error("password hash is required");
    }
    
    try {
      return await bcrypt.compare(password, passwordHash);
    } catch (error) {
      throw new Error(`Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

module.exports = { verifyPasswordUtil };