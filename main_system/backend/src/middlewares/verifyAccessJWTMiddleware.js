const jwt = require("jsonwebtoken");
const { STATUS_CODES } = require("../utils/statusCodesUtil");
const { JWTConfig } = require("../config/JWTConfig");

const verifyAccessJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
            data: null,
            message: "No Token Provided",
            status: STATUS_CODES.UNAUTHORIZED,
            success: false
        });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWTConfig.accessSecret);
        
        req.user = {
            person_id: decoded.person_id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
            data: null,
            message: "Invalid or Expired Token",
            status: STATUS_CODES.UNAUTHORIZED,
            success: false
        });
    }
};

module.exports = {
    verifyAccessJWT
};