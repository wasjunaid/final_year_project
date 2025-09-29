const { pool } = require("../../config/databaseConfig");
const { InsuranceService } = require("../Insurance/InsuranceService");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PatientInsuranceService {
    static async getPatientInsurances(patient_id) {
        try {
            const query = {
                text: `SELECT * FROM patient_insurance
                WHERE
                patient_id = $1`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No insurance found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting insurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPatientInsurance(patient_id, {
        insurance_number,
        insurance_company_id,
    }) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!insurance_number) {
            throw new AppError("insurance_number is required", statusCodes.BAD_REQUEST);
        }
        if (!insurance_company_id) {
            throw new AppError("insurance_company_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const existingInsurance = await InsuranceService.checkInsuranceExists(insurance_number);
            if (existingInsurance) {
                return existingInsurance;
            } else {
                await InsuranceService.insertInsurance(insurance_number, insurance_company_id);
            }

            let is_primary = true;
            const existingPatientInsurance = await this.checkPatientInsuranceExists(patient_id);
            if (existingPatientInsurance) {
                is_primary = false;
            }

            const query = {
                text: `INSERT INTO patient_insurance
                (patient_id, insurance_number, is_primary)
                VALUES ($1, $2, $3)
                RETURNING *`,
                values: [patient_id, insurance_number, is_primary]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error inserting patient insurance", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting patient insurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updatePatientInsurance(patient_id, {
        patient_insurance_id,
        insurance_number,
        is_primary
    }) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }
        if (!patient_insurance_id) {
            throw new AppError("patient_insurance_id is required", statusCodes.BAD_REQUEST);
        }
        if (!insurance_number) {
            throw new AppError("insurance_number is required", statusCodes.BAD_REQUEST);
        }
        if (is_primary === undefined) {
            throw new AppError("is_primary is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `UPDATE patient_insurance
                SET insurance_number = $1,
                is_primary = $2,
                updated_at = CURRENT_TIMESTAMP
                WHERE
                patient_insurance_id = $3
                RETURNING *`,
                values: [insurance_number, is_primary, patient_insurance_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error updating patient insurance", statusCodes.INTERNAL_SERVER_ERROR);
            }

            if (is_primary) {
                const existingPatientInsurance = await this.checkPatientInsuranceExists(patient_id);
                if (existingPatientInsurance) {
                    for (const insurance of existingPatientInsurance) {
                        if (insurance.is_primary && insurance.patient_insurance_id !== patient_insurance_id) {
                            insurance.is_primary = false;
                            await this.updatePatientInsurance(patient_id, insurance);
                        }
                    }
                }
            }

            return result;
        } catch (error) {
            console.error(`Error updating patient insurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async deletePatientInsurance(patient_insurance_id) {
        if (!patient_insurance_id) {
            throw new AppError("patient_insurance_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM patient_insurance
                WHERE
                patient_insurance_id = $1`,
                values: [patient_insurance_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Error deleting patient insurance", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result;
        } catch (error) {
            console.error(`Error deleting patient insurance: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async checkPatientInsuranceExists(patient_id) {
        if (!patient_id) {
            throw new AppError("patient_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT * FROM patient_insurance
                WHERE
                patient_id = $1`,
                values: [patient_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error checking patient insurance exists: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PatientInsuranceService };