const { pool } = require("../../config/databaseConfig");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

class PrescriptionService {
    static async getPrescriptionsAgainstAppointment(appointment_id) {
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT p.*,
                m.name AS medicine_name
                FROM prescription p
                JOIN medicine m ON p.medicine_id = m.medicine_id
                WHERE
                appointment_id = $1`,
                values: [appointment_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("No prescriptions found", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting prescriptions: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPrescription({appointment_id, medicine_id, dosage, instruction}) {
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }
        if (!medicine_id) {
            throw new AppError("medicine_id is required", statusCodes.BAD_REQUEST);
        }
        if (!dosage) {
            throw new AppError("dosage is required", statusCodes.BAD_REQUEST);
        }
        if (!instruction) {
            throw new AppError("instruction is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `INSERT INTO prescription
                (appointment_id, medicine_id, dosage, instruction)
                VALUES
                ($1, $2, $3, $4)
                RETURNING *`,
                values: [appointment_id, medicine_id, dosage, instruction],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to insert prescription", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error inserting prescription: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async updatePrescription(prescription_id, {
        medicine_id,
        dosage,
        instruction
    }) {
        if (!prescription_id) {
            throw new AppError("prescription_id is required", statusCodes.BAD_REQUEST);
        }
        if (!medicine_id) {
            throw new AppError("medicine_id is required", statusCodes.BAD_REQUEST);
        }
        if (!dosage) {
            throw new AppError("dosage is required", statusCodes.BAD_REQUEST);
        }
        if (!instruction) {
            throw new AppError("instruction is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `UPDATE prescription
                SET
                medicine_id = $1,
                dosage = $2,
                instruction = $3,
                updated_at = CURRENT_TIMESTAMP
                WHERE prescription_id = $4
                RETURNING *`,
                values: [medicine_id, dosage, instruction, prescription_id],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Prescription not found or no changes made", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating prescription: ${error.message}`);
            throw new AppError(`Error updating prescription: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async deletePrescription(prescription_id) {
        if (!prescription_id) {
            throw new AppError("prescription_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `DELETE FROM prescription
                WHERE
                prescription_id = $1
                RETURNING *`,
                values: [prescription_id],
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Prescription not found", statusCodes.NOT_FOUND);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error updating prescription: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { PrescriptionService };