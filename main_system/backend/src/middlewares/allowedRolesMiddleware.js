const { STATUS_CODES } = require("../utils/validConstantsUtil");

function allowedRoles(roles) {
  return (req, res, next) => {
    // Check if STATUS_CODES exists, otherwise use direct status codes
    const FORBIDDEN = STATUS_CODES?.FORBIDDEN || 403;
    const UNAUTHORIZED = STATUS_CODES?.UNAUTHORIZED || 401;
    
    if (!req.user) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(FORBIDDEN).json({
        success: false,
        message: "Access forbidden: insufficient permissions",
      });
    }

    next();
  };
}

module.exports = { allowedRoles };