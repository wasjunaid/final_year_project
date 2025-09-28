const bcrypt = require("bcrypt");

const hashPasswordUtil = async (password, saltRounds = 10) => {
    if (!password) {
      throw new Error("password is required");
    }
    
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error(`Error hashing password: ${error.message} ${error.status}`);
      throw error;
    }
}

module.exports = { hashPasswordUtil };