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
      console.error(`Error verifying password: ${error.message} ${error.status}`);
      throw error;
    }
}

module.exports = { verifyPasswordUtil };