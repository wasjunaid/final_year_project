const { STATUS_CODES } = require("../utils/statusCodesUtil");

const allowedRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        data: null,
        message: "Forbidden",
        status: STATUS_CODES.FORBIDDEN,
        success: false
      });
    }

    next();
  };
}

module.exports = { allowedRoles };