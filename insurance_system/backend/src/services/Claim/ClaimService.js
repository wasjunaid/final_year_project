const { DatabaseService } = require("../DatabaseService");
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { DB_ERROR_CODES } = require("../../utils/databaseErrorCodesUtil");
const { InsuranceStaffService } = require("../Insurance/InsuranceStaffService");
const axios = require("axios");
const { PROJECT_BACKEND_BASE_URL, PROJECT_BACKEND_UPDATE_CLAIM_STATUS_ENDPOINT } = require("../../config/projectBackendConfig");

class ClaimService {
    static async getAllClaimsIfExists(user_id) {
        try {
            if (!user_id) {
                throw new AppError("User ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const insuranceStaff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!insuranceStaff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `
                    SELECT * FROM claim c WHERE c.insurance_number IN (
                        SELECT i.insurance_number FROM insurance i JOIN insurance_plan ip ON i.insurance_plan_id = ip.insurance_plan_id
                        WHERE ip.insurance_company_id = $1
                    )
                `,
                values: [insuranceStaff.insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in ClaimService.getAllClaims: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getAllAcceptedandNotPaidClaimsAgainstInsuranceCompany(user_id) {
        try {
            if (!user_id) {
                throw new AppError("User ID is required", STATUS_CODES.BAD_REQUEST);
            }

            const insuranceStaff = await InsuranceStaffService.getInsuranceStaffIfExists(user_id);
            if (!insuranceStaff) {
                throw new AppError("Insurance staff not found", STATUS_CODES.NOT_FOUND);
            }

            const query = {
                text: `SELECT * FROM claim c WHERE c.status = 'APPROVED' AND c.is_paid = FALSE AND c.insurance_number IN (
                    SELECT i.insurance_number FROM insurance i JOIN insurance_plan ip ON i.insurance_plan_id = ip.insurance_plan_id
                    WHERE ip.insurance_company_id = $1
                )`,
                values: [insuranceStaff.insurance_company_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in ClaimService.getAllAcceptedandNotPaidClaimsAgainstInsuranceCompany: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertClaim({claim_id_in_hospital_system, insurance_number, cnic, claim_amount, icd_codes, cpt_codes, appointment_date, hospital_name, doctor_name}) {
        try {
            let statusFlag = false;

            if (!claim_id_in_hospital_system) {
                throw new AppError("Claim ID in hospital system is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!insurance_number) {
                throw new AppError("Insurance number is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!cnic) {
                throw new AppError("CNIC is required", STATUS_CODES.BAD_REQUEST);
            }

            // check hospital name in panel list etc if needed, also insurance number matching cnic etc

            const query = {
                text: `INSERT INTO claim 
                    (claim_id_in_hospital_system, insurance_number, cnic, claim_amount, icd_codes, cpt_codes, appointment_date, hospital_name, doctor_name)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING *`,
                values: [claim_id_in_hospital_system, insurance_number, cnic, claim_amount, icd_codes, cpt_codes, appointment_date, hospital_name, doctor_name]
            };

            if (!claim_amount || !icd_codes || !cpt_codes || !appointment_date || !hospital_name || !doctor_name) {
                query.text = `
                    INSERT INTO claim (claim_id_in_hospital_system, insurance_number, cnic, status)
                    VALUES ($1, $2, $3, 'REJECTED')
                    RETURNING *`;
                query.values = [claim_id_in_hospital_system, insurance_number, cnic];
                statusFlag = true;
            }

            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error inserting claim", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            if (statusFlag) {
                    const response = await axios.post(`${PROJECT_BACKEND_BASE_URL}${PROJECT_BACKEND_UPDATE_CLAIM_STATUS_ENDPOINT}`, {
                    claim_id: claim_id_in_hospital_system,
                    status: 'REJECTED'
                });
                if (!response.data.success) {
                    throw new AppError("Sending Claim Status Back Failed", STATUS_CODES.INTERNAL_SERVER_ERROR);
                }
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in ClaimService.insertClaim: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateClaimStatus(claim_id, status) {
        try {
            if (!claim_id) {
                throw new AppError("Claim ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!status) {
                throw new AppError("Status is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                throw new AppError("Invalid status value", STATUS_CODES.BAD_REQUEST);
            }

            await DatabaseService.query("BEGIN");

            const existingClaimQuery = {
                text: `SELECT * FROM claim WHERE claim_id = $1 FOR UPDATE`,
                values: [claim_id],
            };
            const existingClaimResult = await DatabaseService.query(existingClaimQuery.text, existingClaimQuery.values);
            if (existingClaimResult.rowCount === 0) {
                throw new AppError("Error updating claim status", STATUS_CODES.NOT_FOUND);
            }

            const existingClaim = existingClaimResult.rows[0];
            const previousStatus = String(existingClaim.status || '').toUpperCase();

            if (status === 'APPROVED' && previousStatus !== 'APPROVED') {
                const insuranceQuery = {
                    text: `SELECT i.insurance_number, i.amount_remaining, i.end_date, ip.coverage_amount
                           FROM insurance i
                           JOIN insurance_plan ip ON ip.insurance_plan_id = i.insurance_plan_id
                           WHERE i.insurance_number = $1
                           FOR UPDATE`,
                    values: [existingClaim.insurance_number],
                };
                const insuranceResult = await DatabaseService.query(insuranceQuery.text, insuranceQuery.values);
                if (insuranceResult.rowCount === 0) {
                    throw new AppError("Insurance policy not found for claim", STATUS_CODES.BAD_REQUEST);
                }

                const insurance = insuranceResult.rows[0];
                let amountRemaining = Number(insurance.amount_remaining || 0);
                const claimAmount = Number(existingClaim.claim_amount || 0);

                const isExpired = insurance.end_date ? (new Date(insurance.end_date) < new Date()) : false;
                if (isExpired) {
                    amountRemaining = Number(insurance.coverage_amount || 0);
                    const renewQuery = {
                        text: `UPDATE insurance
                               SET
                               start_date = CURRENT_TIMESTAMP,
                               end_date = CURRENT_TIMESTAMP + INTERVAL '1 year',
                               amount_remaining = $2
                               WHERE insurance_number = $1`,
                        values: [insurance.insurance_number, amountRemaining],
                    };
                    await DatabaseService.query(renewQuery.text, renewQuery.values);
                }

                if (claimAmount > amountRemaining) {
                    throw new AppError("Insufficient amount remaining in insurance policy", STATUS_CODES.BAD_REQUEST);
                }

                const nextAmountRemaining = amountRemaining - claimAmount;
                const deductQuery = {
                    text: `UPDATE insurance SET amount_remaining = $2 WHERE insurance_number = $1`,
                    values: [insurance.insurance_number, nextAmountRemaining],
                };
                await DatabaseService.query(deductQuery.text, deductQuery.values);
            }

            const query = {
                text: `UPDATE claim SET status = $2 WHERE claim_id = $1 RETURNING *`,
                values: [claim_id, status]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error updating claim status", STATUS_CODES.NOT_FOUND);
            }

            await DatabaseService.query("COMMIT");

            const response = await axios.put(`${PROJECT_BACKEND_BASE_URL}${PROJECT_BACKEND_UPDATE_CLAIM_STATUS_ENDPOINT}`, {
                claim_id: result.rows[0].claim_id_in_hospital_system,
                status: status.toLowerCase()
            });
            if (!response.data.success) {
                throw new AppError("Sending Claim Status Back Failed", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            try {
                await DatabaseService.query("ROLLBACK");
            } catch (_) {}
            console.error(`Error in ClaimService.updateClaimStatus: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updateTransactionDetails({
        claim_id,
        transaction_hash,
        block_number,
        from_wallet,
        to_wallet,
        amount_paid
    }) {
        try {
            if (!claim_id) {
                throw new AppError("Claim ID is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!transaction_hash) {
                throw new AppError("Transaction hash is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!block_number) {
                throw new AppError("Block number is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!from_wallet) {
                throw new AppError("From wallet is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!to_wallet) {
                throw new AppError("To wallet is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!amount_paid) {
                throw new AppError("Amount paid is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `
                    UPDATE claim
                    SET
                    transaction_hash = $2,
                    block_number = $3,
                    from_wallet = $4,
                    to_wallet = $5,
                    amount_paid = $6,
                    is_paid = TRUE,
                    payment_date = CURRENT_TIMESTAMP
                    WHERE claim_id_in_hospital_system = $1
                    RETURNING *
                `,
                values: [claim_id, transaction_hash, block_number, from_wallet, to_wallet, amount_paid]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Error updating transaction details", STATUS_CODES.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in ClaimService.updateTransactionDetails: ${error.message} ${error.status}`);
            throw error;
        }
    }
};

module.exports = { ClaimService };