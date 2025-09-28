const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/databaseConfig');
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class VerifiedDocumentService {
    static async getVerifiedDocuments(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT 
                d.document_id, 
                d.original_name, 
                d.mime_type, 
                d.file_size,
                d.document_type, 
                d.created_at,
                d.detail,
                p.first_name AS uploaded_by_first_name,
                p.last_name AS uploaded_by_last_name,
                lt.name AS lab_test_name,
                lt.description AS lab_test_description,
                lt.cost AS lab_test_cost
                FROM verified_document vd
                JOIN person p ON vd.uploaded_by = p.person_id
                JOIN lab_test lt ON vd.lab_test_id = lt.lab_test_id
                WHERE
                person_id = $1
                ORDER BY
                created_at DESC`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to retrieve verified document information", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            throw new AppError(`error getting documents ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async uploadVerifiedDocument(person_id, {
            original_name,
            file_name,
            mimetype,
            file_path,
            file_size,
            document_type,
            uploaded_by,
            appointment_id,
            lab_test_id,
            detail
        }) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }
        if (!original_name) {
            throw new AppError("original_name is required", statusCodes.BAD_REQUEST);
        }
        if (!file_name) {
            throw new AppError("file_name is required", statusCodes.BAD_REQUEST);
        }
        if (!mimetype) {
            throw new AppError("mimetype is required", statusCodes.BAD_REQUEST);
        }
        if (!file_path) {
            throw new AppError("file_path is required", statusCodes.BAD_REQUEST);
        }
        if (!file_size) {
            throw new AppError("file_size is required", statusCodes.BAD_REQUEST);
        }
        if (!document_type) {
            throw new AppError("document_type is required", statusCodes.BAD_REQUEST);
        }
        if (!uploaded_by) {
            throw new AppError("uploaded_by is required", statusCodes.BAD_REQUEST);
        }
        if (!appointment_id) {
            throw new AppError("appointment_id is required", statusCodes.BAD_REQUEST);
        }
        if (!lab_test_id) {
            throw new AppError("lab_test_id is required", statusCodes.BAD_REQUEST);
        }
        if (!detail) {
            throw new AppError("detail is required", statusCodes.BAD_REQUEST);
        }

        try {
            const document_id = uuidv4();
  
            const query = {
                text: `INSERT INTO verified_document
                (document_id, person_id, original_name, file_name, mime_type, file_path, file_size, document_type, uploaded_by, appointment_id, lab_test_id, detail)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *`,
                values: [document_id, person_id, original_name, file_name, mimetype, file_path, file_size, document_type, uploaded_by, appointment_id, lab_test_id, detail]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to save document information", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            throw new AppError(`error uploading document: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { VerifiedDocumentService };