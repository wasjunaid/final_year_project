const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { DatabaseService } = require('../DatabaseService');
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT, VALID_UNVERIFIED_DOCUMENT_TYPES } = require("../../utils/validConstantsUtil");
const { LabTestService } = require('../LabTest/LabTestService');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class LabTestDocumentService {
    static async insertPlaceholderForLabTestDocument({ patient_id, appointment_id, lab_test_id, hospital_id }) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!lab_test_id) {
                throw new AppError("lab_test_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!hospital_id) {
                throw new AppError("hospital_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const labTest = await LabTestService.getLabTestIfExists(lab_test_id, hospital_id);
            if (!labTest) {
                throw new AppError("Lab test not found", STATUS_CODES.NOT_FOUND);
            }

            const doc_id = uuidv4();

            const query = {
                text: `INSERT INTO document
                (document_id, patient_id, document_type, appointment_id, lab_test_id, lab_test_cost)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [
                    doc_id,
                    patient_id,
                    VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT.LAB_TEST,
                    appointment_id,
                    lab_test_id,
                    labTest.cost
                ]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert lab test document placeholder", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in LabTestDocumentService.insertPlaceholderForLabTestDocument: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { LabTestDocumentService };