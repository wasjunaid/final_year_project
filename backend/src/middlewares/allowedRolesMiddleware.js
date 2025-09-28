const { statusCodes } = require("../utils/statusCodesUtil");

const allowedRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(statusCodes.FORBIDDEN).json({
        data: null,
        message: "Forbidden",
        status: statusCodes.FORBIDDEN,
        success: false
      });
    }

    next();
  };
}

module.exports = { allowedRoles };