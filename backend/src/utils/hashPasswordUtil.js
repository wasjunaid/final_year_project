const bcrypt = require("bcrypt");

const hashPasswordUtil = async (password, saltRounds = 10) => {
    if (!password) {
      throw new Error("password is required");
    }
    
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
}

module.exports = { hashPasswordUtil };