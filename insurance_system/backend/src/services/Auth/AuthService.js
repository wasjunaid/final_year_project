const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { JWTService } = require("./JWTService");
const { UserService } = require("../User/UserService");
const { SuperAdminService } = require("../System/SuperAdminService");
const { InsuranceStaffService } = require("../Insurance/InsuranceStaffService");
const { VALID_ROLES_OBJECT, VALID_ROLES_FOR_SIGN_IN, VALID_INSURANCE_STAFF_ROLES } = require("../../utils/validConstantsUtil");

class AuthService {
    static async signIn({ email, password, role }) {
        try {
            if (!email) {
                throw new AppError("email is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!password) {
                throw new AppError("password is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!role) {
                throw new AppError("role is required", STATUS_CODES.BAD_REQUEST);
            }

            role = role.trim().toLowerCase();

            if (!VALID_ROLES_FOR_SIGN_IN.includes(role)) {
                throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
            }

            const user = await UserService.compareEmailAndPassword(email, password);

            if (role === VALID_ROLES_OBJECT.SUPER_ADMIN) {
                const superAdminExists = await SuperAdminService.getSuperAdminIfExists(user.user_id);
                if (!superAdminExists) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
            } else if (VALID_INSURANCE_STAFF_ROLES.includes(role)) {
                const insuranceStaffExists = await InsuranceStaffService.getInsuranceStaffIfExists(user.user_id);
                if (!insuranceStaffExists && insuranceStaffExists.role !== role) {
                    throw new AppError("Invalid Credentials", STATUS_CODES.UNAUTHORIZED);
                }
            }

            const tokens = await JWTService.generateJWT(user.user_id, role);

            return tokens;
        } catch (error) {
            console.error(`Error in AuthService.signIn: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { AuthService };