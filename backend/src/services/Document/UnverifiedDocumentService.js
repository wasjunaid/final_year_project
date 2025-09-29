const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/databaseConfig');
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");
const { validUnverifiedDocumentTypes } = require("../../database/document/unverifiedDocumentTableQuery");

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class UnverifiedDocumentService {
    static async getUnverifiedDocuments(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const query = {
                text: `SELECT 
                document_id, 
                original_name, 
                mime_type, 
                file_size,
                document_type, 
                detail,
                created_at
                FROM unverified_document
                WHERE
                person_id = $1
                ORDER BY
                created_at DESC`,
                values: [person_id]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to retrieve unverified document information", statusCodes.NOT_FOUND);
            }

            return result.rows;
        } catch (error) {
            console.error(`Error getting unverified documents: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async uploadUnverifiedDocument(person_id, {
            original_name,
            file_name,
            mimetype,
            file_path,
            file_size,
            document_type,
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
        if (!validUnverifiedDocumentTypes.includes(document_type)) {
            throw new AppError(`invalid document_type`, statusCodes.BAD_REQUEST);
        }
        if (!detail) {
            throw new AppError("detail is required", statusCodes.BAD_REQUEST);
        }

        try {
            const document_id = uuidv4();

            const query = {
                text: `INSERT INTO unverified_document
                (document_id, person_id, original_name, file_name, mime_type, file_path, file_size, document_type, detail)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                values: [document_id, person_id, original_name, file_name, mimetype, file_path, file_size, document_type, detail]
            };
            const result = await pool.query(query);
            if (result.rows.length === 0) {
                throw new AppError("Failed to save document information", statusCodes.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error uploading unverified documents: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { UnverifiedDocumentService };