const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { DatabaseService } = require('../DatabaseService');
const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const { VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT, VALID_UNVERIFIED_DOCUMENT_TYPES } = require("../../utils/validConstantsUtil");
const { encryptCID, decryptCID } = require('../../utils/encryption');
const { HospitalStaffService } = require('../Hospital/HospitalStaffService');
const { LabTestService } = require('../LabTest/LabTestService');
const { AppointmentDetailService } = require('../Appointment/AppointmentDetailService');
const { uploadMedicalDocument, getBinaryFromIPFS, unpinFile } = require('../../utils/ipfs');

class DocumentService {
    static normalizeListOptions(options = {}) {
        const search = String(options.search || "").trim();
        const page = Math.max(1, Number(options.page) || 1);
        const exportAll = options.exportAll === true;
        const limit = exportAll
            ? Math.max(1, Number(options.limit) || 100000)
            : Math.min(200, Math.max(1, Number(options.limit) || 50));
        return { search, page, limit, exportAll };
    }

    static buildDocumentSearchWhereClause(values, search) {
        if (!search) {
            return "";
        }

        values.push(`%${search}%`);
        const placeholder = `$${values.length}`;
        return `
            AND (
                COALESCE(original_name, '') ILIKE ${placeholder}
                OR COALESCE(document_type, '') ILIKE ${placeholder}
                OR COALESCE(detail, '') ILIKE ${placeholder}
                OR COALESCE(lab_test_name, '') ILIKE ${placeholder}
                OR COALESCE(hospital_name, '') ILIKE ${placeholder}
            )
        `;
    }

    static async getDocumentsFromView(viewName, patient_id, options = {}) {
        const { search, page, limit } = this.normalizeListOptions(options);
        const values = [patient_id];
        const searchClause = this.buildDocumentSearchWhereClause(values, search);

        const whereClause = `WHERE patient_id = $1 ${searchClause}`;
        const offset = (page - 1) * limit;

        const countQuery = {
            text: `SELECT COUNT(*)::int AS total_items FROM ${viewName} ${whereClause}`,
            values,
        };

        const dataQuery = {
            text: `SELECT * FROM ${viewName}
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            values: [...values, limit, offset],
        };

        const [countResult, result] = await Promise.all([
            DatabaseService.query(countQuery.text, countQuery.values),
            DatabaseService.query(dataQuery.text, dataQuery.values),
        ]);

        const totalItems = countResult.rows[0]?.total_items || 0;
        const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

        return {
            rows: result.rows || [],
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
            },
        };
    }

    static async getAllDocumentsUnified(patient_id, options = {}) {
        const { search, page, limit } = this.normalizeListOptions(options);
        const values = [patient_id];

        let searchClause = "";
        if (search) {
            values.push(`%${search}%`);
            const placeholder = `$${values.length}`;
            searchClause = `
                AND (
                    COALESCE(d.original_name, '') ILIKE ${placeholder}
                    OR COALESCE(d.document_type, '') ILIKE ${placeholder}
                    OR COALESCE(d.detail, '') ILIKE ${placeholder}
                    OR COALESCE(lt.name, '') ILIKE ${placeholder}
                    OR COALESCE(h.name, '') ILIKE ${placeholder}
                )
            `;
        }

        const whereClause = `WHERE d.patient_id = $1 ${searchClause}`;
        const offset = (page - 1) * limit;

        const countQuery = {
            text: `SELECT COUNT(*)::int AS total_items
            FROM document d
            LEFT JOIN appointment a ON d.appointment_id = a.appointment_id
            LEFT JOIN hospital h ON a.hospital_id = h.hospital_id
            LEFT JOIN lab_test lt ON d.lab_test_id = lt.lab_test_id
            ${whereClause}`,
            values,
        };

        const dataQuery = {
            text: `SELECT
                d.document_id,
                d.patient_id,
                d.original_name,
                d.mime_type,
                d.file_size,
                d.ipfs_hash,
                TO_CHAR(d.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                TO_CHAR(d.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at,
                d.document_type,
                d.is_verified,
                d.detail,
                d.uploaded_by,
                p.first_name AS uploaded_by_first_name,
                p.last_name AS uploaded_by_last_name,
                d.appointment_id,
                a.hospital_id,
                h.name AS hospital_name,
                d.lab_test_id,
                lt.name AS lab_test_name,
                lt.description AS lab_test_description,
                d.lab_test_cost
            FROM document d
            LEFT JOIN person p ON d.uploaded_by = p.person_id
            LEFT JOIN appointment a ON d.appointment_id = a.appointment_id
            LEFT JOIN hospital h ON a.hospital_id = h.hospital_id
            LEFT JOIN lab_test lt ON d.lab_test_id = lt.lab_test_id
            ${whereClause}
            ORDER BY d.created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            values: [...values, limit, offset],
        };

        const [countResult, result] = await Promise.all([
            DatabaseService.query(countQuery.text, countQuery.values),
            DatabaseService.query(dataQuery.text, dataQuery.values),
        ]);

        const totalItems = countResult.rows[0]?.total_items || 0;
        const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

        return {
            rows: result.rows || [],
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
            },
        };
    }
    static escapeCsvValue(value) {
        if (value === null || value === undefined) {
            return "";
        }

        const raw = String(value);
        return `"${raw.replace(/"/g, '""')}"`;
    }

    static buildDocumentsCsvRows(documents = []) {
        const columns = [
            "document_id",
            "patient_id",
            "original_name",
            "document_type",
            "is_verified",
            "detail",
            "appointment_id",
            "hospital_id",
            "hospital_name",
            "lab_test_id",
            "lab_test_name",
            "mime_type",
            "file_size",
            "created_at",
            "updated_at",
        ];

        const header = columns.join(",");
        const rows = documents.map((document) => {
            const row = columns.map((column) => this.escapeCsvValue(document[column]));
            return row.join(",");
        });

        return [header, ...rows].join("\n");
    }

    static normalizeExportScope(scope) {
        const normalizedScope = String(scope || "all").trim().toLowerCase();
        if (["all", "verified", "unverified"].includes(normalizedScope)) {
            return normalizedScope;
        }

        return "all";
    }

    static filterDocumentsForCsv(documents = [], search = "") {
        const query = String(search || "").trim().toLowerCase();
        if (!query) {
            return documents;
        }

        return documents.filter((document) => {
            const fields = [
                document.original_name,
                document.document_type,
                document.detail,
                document.lab_test_name,
                document.hospital_name,
            ];

            return fields.some((field) => String(field || "").toLowerCase().includes(query));
        });
    }
    /**
     * Fetches a document by its ID, checking if it's verified or unverified.
     * @param {number} patient_id - The ID of the patient requesting the document.
     * @param {number} document_id - The ID of the document.
     * @return {Promise<object|boolean>} The document object or false if not found.
     * @throws {AppError} if any issue occurs
     */
    static async getDocumentIfExists(patient_id, document_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT is_verified FROM document
                WHERE
                document_id = $1 AND patient_id = $2`,
                values: [document_id, patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            if (!result.rows[0].is_verified) {
                return await this.getUnverifiedDocumentIfExists(document_id);
            }

            return await this.getVerifiedDocumentIfExists(document_id);
        } catch (error) {
            console.error(`Error in DocumentService.getDocumentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches an unverified document by its ID.
     * @param {number} document_id - The ID of the document.
     * @return {Promise<object|boolean>} The unverified document object or false if not found.
     * @throws {AppError} if any issue occurs
     */
    static async getUnverifiedDocumentIfExists(document_id) {
        try {
            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM unverified_document_view
                WHERE
                document_id = $1`,
                values: [document_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in DocumentService.getUnverifiedDocumentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches a verified document by its ID.
     * @param {number} document_id - The ID of the document.
     * @return {Promise<object|boolean>} The verified document object or false if not found.
     * @throws {AppError} if any issue occurs
     */
    static async getVerifiedDocumentIfExists(document_id) {
        try {
            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM verified_document_view
                WHERE
                document_id = $1`,
                values: [document_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in DocumentService.getVerifiedDocumentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all unverified documents for a given patient_id.
     * @param {number} patient_id - The ID of the patient.
     * @return {Promise<Array|boolean>} Array of unverified documents or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getAllUnverifiedDocumentsIfExists(patient_id, options = {}) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            return await this.getDocumentsFromView("unverified_document_view", patient_id, options);
        } catch (error) {
            console.error(`Error in DocumentService.getAllUnverifiedDocumentsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all verified documents for a given patient_id.
     * @param {number} patient_id - The ID of the patient.
     * @return {Promise<Array|boolean>} Array of verified documents or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getAllVerifiedDocumentsIfExists(patient_id, options = {}) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            return await this.getDocumentsFromView("verified_document_view", patient_id, options);
        } catch (error) {
            console.error(`Error in DocumentService.getAllVerifiedDocumentsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all documents (both verified and unverified) for a given patient_id.
     * @param {number} patient_id - The ID of the patient.
     * @return {Promise<{unverified: Array, verified: Array}>} Object containing arrays of unverified and verified documents.
     * @throws {AppError} if any issue occurs
     */
    static async getAllDocumentsIfExists(patient_id, options = {}) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const unified = await this.getAllDocumentsUnified(patient_id, options);
            const unverified = [];
            const verified = [];

            for (const document of unified.rows) {
                if (document.is_verified) {
                    verified.push(document);
                } else {
                    unverified.push(document);
                }
            }

            const documents = {
                unverified,
                verified,
                pagination: unified.pagination,
            };

            return documents;
        } catch (error) {
            console.error(`Error in DocumentService.getAllDocumentsIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all verified documents linked to a specific appointment for a patient.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} appointment_id - The ID of the appointment.
     * @return {Promise<Array|boolean>} Array of verified documents or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getAllVerifiedDocumentsAgainstAppointmentIfExists(patient_id, appointment_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const AppointmentService = getAppointmentService();
            const appointment = await AppointmentService.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError('Appointment not found', STATUS_CODES.NOT_FOUND);
            }

            if (appointment.patient_id !== patient_id) {
                throw new AppError('Appointment does not belong to the given patient', STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `SELECT * FROM verified_document_view
                WHERE
                patient_id = $1 AND
                appointment_id = $2`,
                values: [patient_id, appointment_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in DocumentService.getAllVerifiedDocumentsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Fetches all unverified documents linked to a specific appointment for a patient.
     * @param {number} patient_id - The ID of the patient.
     * @param {number} appointment_id - The ID of the appointment.
     * @return {Promise<Array|boolean>} Array of unverified documents or false if none found.
     * @throws {AppError} if any issue occurs
     */
    static async getAllUnverifiedDocumentsAgainstAppointmentIfExists(patient_id, appointment_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const AppointmentService = getAppointmentService();
            const appointment = await AppointmentService.getAppointmentIfExists(appointment_id);
            if (!appointment) {
                throw new AppError('Appointment not found', STATUS_CODES.NOT_FOUND);
            }

            if (appointment.patient_id !== patient_id) {
                throw new AppError('Appointment does not belong to the given patient', STATUS_CODES.FORBIDDEN);
            }

            const query = {
                text: `SELECT * FROM unverified_document_view
                WHERE
                patient_id = $1 AND
                appointment_id = $2`,
                values: [patient_id, appointment_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in DocumentService.getAllUnverifiedDocumentsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getPlaceholdersForLabTestDocumentsForLabTech(person_id) {
        try {
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const staff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!staff) {
                throw new AppError("Only hospital staff can access lab test document placeholders", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM unverified_document_view
                WHERE document_type = $1 AND original_name IS NULL`,
                values: [VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT.LAB_TEST]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            const filteredRows = [];

            for (const row of result.rows) {
                if (row.hospital_id_of_appointment === staff.hospital_id) {
                    filteredRows.push(row);
                }
            }

            return filteredRows;
        } catch (error) {
            console.error(`Error in DocumentService.getPlaceholdersForLabTestDocumentsForLabTech: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async getPlaceholdersForLabTestDocumentsForPatient(patient_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const query = {
                text: `SELECT * FROM unverified_document_view
                WHERE document_type = $1 AND original_name IS NULL AND patient_id = $2`,
                values: [VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT.LAB_TEST, patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                return false;
            }

            return result.rows;
        } catch (error) {
            console.error(`Error in DocumentService.getPlaceholdersForLabTestDocumentsForPatient: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async insertPlaceholderForLabTestDocument({patient_id, appointment_id, lab_test_id}) {
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

            const appointment = await AppointmentDetailService.getAppointmentDetailsIfExists(appointment_id);
            if (!appointment) {
                throw new AppError("Invalid appointment_id", STATUS_CODES.BAD_REQUEST);
            }
            
            const labTest = await LabTestService.getLabTestIfExists(lab_test_id, appointment.hospital_id);
            if (!labTest) {
                throw new AppError("Invalid lab_test_id", STATUS_CODES.BAD_REQUEST);
            }

            const document_id = uuidv4();

            const query = {
                text: `INSERT INTO document
                (document_id, patient_id, appointment_id, lab_test_id, lab_test_cost, document_type)
                VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                values: [document_id, patient_id, appointment_id, lab_test_id, labTest.cost, VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT.LAB_TEST]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                throw new AppError("Failed to insert placeholder document", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            return result.rows[0];
        } catch (error) {
            console.error(`Error in DocumentService.insertPlaceholderForLabTestDocument: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Uploads a new unverified document to IPFS.
     * @param {object} params - Document parameters.
     * @param {number} params.patient_id - The ID of the patient uploading the document.
     * @param {Buffer} params.buffer - The file buffer from multer (req.file.buffer).
     * @param {string} params.originalname - The original name of the file.
     * @param {string} params.mimetype - The MIME type of the file.
     * @param {number} params.size - The size of the file in bytes.
     * @param {string} params.document_type - The type of the document (must be in VALID_UNVERIFIED_DOCUMENT_TYPES).
     * @param {string} params.detail - Additional details about the document.
     * @returns {Promise<object>} The inserted document object.
     * @throws {AppError} if any issue occurs
     */
    static async uploadUnverifiedDocument({patient_id, buffer, originalname, mimetype, size, document_type, detail}) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!buffer) {
                throw new AppError("buffer is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!originalname) {
                throw new AppError("originalname is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!mimetype) {
                throw new AppError("mimetype is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!size) {
                throw new AppError("size is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!document_type) {
                throw new AppError("document_type is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!VALID_UNVERIFIED_DOCUMENT_TYPES.includes(document_type)) {
                throw new AppError(`document_type must be one of: ${VALID_UNVERIFIED_DOCUMENT_TYPES.join(', ')}`, STATUS_CODES.BAD_REQUEST);
            }

            if (!detail) {
                throw new AppError("detail is required", STATUS_CODES.BAD_REQUEST);
            }

            detail = detail.trim();
            if (detail.length === 0) {
                throw new AppError("detail cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            // Upload to IPFS
            console.log(`[DocumentService] Uploading unverified document to IPFS for patient ${patient_id}`);
            const ipfsResult = await uploadMedicalDocument(buffer, {
                originalName: originalname,
                mimeType: mimetype,
                documentType: document_type,
                patientId: patient_id,
                isVerified: false,
            });

            const document_id = uuidv4();
            const ipfs_hash = ipfsResult.ipfsHash;
            const file_size = ipfsResult.pinSize;

            //ENCRYPT CID BEFORE STORING
            const encryptedCID = encryptCID(ipfs_hash);
            console.log(`[DocumentService] ✓ CID encrypted for storage`);

            // Generate a unique filename for reference (not used for storage)
            const filename = `${document_id}-${originalname}`;

            console.log(`[DocumentService] IPFS upload successful - CID: ${ipfs_hash}`);

            // Save to database
            const query = {
                text: `INSERT INTO document
                (document_id, patient_id, original_name, file_name, mime_type, file_size, ipfs_hash, document_type, detail)
                VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                values: [document_id, patient_id, originalname, filename, mimetype, file_size, encryptedCID, document_type, detail]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                // If DB insert fails, attempt to unpin from IPFS
                try {
                    await unpinFile(ipfs_hash);
                } catch (unpinError) {
                    console.error(`[DocumentService] Failed to unpin IPFS file after DB error: ${unpinError.message}`);
                }
                throw new AppError("Failed to save document information", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            console.log(`[DocumentService] Document saved to database with ID: ${document_id}`);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in DocumentService.uploadUnverifiedDocument: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Uploads and verifies a document to IPFS, linking it to an appointment and lab test.
     * @param {object} params - Document parameters.
     * @param {number} params.person_id - The ID of the person uploading the document.
     * @param {Buffer} params.buffer - The file buffer from multer (req.file.buffer).
     * @param {string} params.originalname - The original name of the file.
     * @param {string} params.mimetype - The MIME type of the file.
     * @param {number} params.size - The size of the file in bytes.
     * @param {number} params.appointment_id - The ID of the appointment to link the document to.
     * @param {number} params.lab_test_id - The ID of the lab test to link the document to.
     * @param {string} params.detail - Additional details about the document.
     * @return {Promise<object>} The inserted and verified document object.
     * @throws {AppError} if any issue occurs
     */
    static async uploadVerifiedDocumentAgainstPlaceholder({document_id, person_id, buffer, originalname, mimetype, size, detail }) {
        try {
            console.log('[DocumentService] Starting uploadVerifiedDocumentAgainstPlaceholder');
        console.log('[DocumentService] Inputs:', { document_id, person_id, originalname });
            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!buffer) {
                throw new AppError("buffer is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!originalname) {
                throw new AppError("originalname is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!mimetype) {
                throw new AppError("mimetype is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!size) {
                throw new AppError("size is required", STATUS_CODES.BAD_REQUEST);
            }

            const placeholderDocument = await this.getUnverifiedDocumentIfExists(document_id);
            if (!placeholderDocument) {
                throw new AppError("Placeholder document not found", STATUS_CODES.NOT_FOUND);
            }

            const staff = await HospitalStaffService.getHospitalStaffIfExists(person_id);
            if (!staff) {
                throw new AppError("Invalid uploaded_by person_id", STATUS_CODES.BAD_REQUEST);
            }

            if (staff.hospital_id !== placeholderDocument.hospital_id_of_appointment) {
                throw new AppError("Uploader does not belong to the same hospital as the appointment", STATUS_CODES.FORBIDDEN);
            }

            if (!detail) {
                throw new AppError("detail is required", STATUS_CODES.BAD_REQUEST);
            }

            detail = detail.trim();
            if (detail.length === 0) {
                throw new AppError("detail cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            // Upload to IPFS
            console.log(`[DocumentService] Uploading verified document to IPFS for appointment ${placeholderDocument.appointment_id}`);
            const ipfsResult = await uploadMedicalDocument(buffer, {
                originalName: originalname,
                mimeType: mimetype,
                documentType: VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT.LAB_TEST,
                patientId: placeholderDocument.patient_id,
                appointmentId: placeholderDocument.appointment_id,
                labTestId: placeholderDocument.lab_test_id,
                isVerified: true,
                uploadedBy: person_id,
            });

            const ipfs_hash = ipfsResult.ipfsHash;
            const file_size = ipfsResult.pinSize;
            
            const encryptedCID = encryptCID(ipfs_hash);
            console.log(`[DocumentService] ✓ CID encrypted for storage`);
            // Generate a unique filename for reference
            const filename = `${document_id}-${originalname}`;

            console.log(`[DocumentService] IPFS upload successful - CID: ${ipfs_hash}`);
  
            // Save to database
            const query = {
                text: `UPDATE document
                SET
                original_name = $2,
                file_name = $3,
                mime_type = $4,
                ipfs_hash = $5,
                file_size = $6,
                uploaded_by = $7,
                detail = $8,
                is_verified = $9
                WHERE
                document_id = $1
                RETURNING *`,
                values: [document_id, originalname, filename, mimetype, ipfs_hash, file_size, person_id, detail, true]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                // If DB insert fails, attempt to unpin from IPFS
                try {
                    await unpinFile(ipfs_hash);
                } catch (unpinError) {
                    console.error(`[DocumentService] Failed to unpin IPFS file after DB error: ${unpinError.message}`);
                }
                throw new AppError("Failed to save document information", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            console.log(`[DocumentService] Verified document saved to database with ID: ${document_id}`);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in DocumentService.uploadVerifiedDocumentAgainstPlaceholder: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async uploadUnverifiedDocumentAgainstPlaceholder({document_id, person_id, buffer, originalname, mimetype, size, detail }) {
        try {
            console.log('[DocumentService] Starting uploadUnverifiedDocumentAgainstPlaceholder');
        console.log('[DocumentService] Inputs:', { document_id, person_id, originalname });
            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }
            if (!person_id) {
                throw new AppError("person_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!buffer) {
                throw new AppError("buffer is required", STATUS_CODES.BAD_REQUEST);
            }
            
            if (!originalname) {
                throw new AppError("originalname is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!mimetype) {
                throw new AppError("mimetype is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!size) {
                throw new AppError("size is required", STATUS_CODES.BAD_REQUEST);
            }

            const placeholderDocument = await this.getUnverifiedDocumentIfExists(document_id);
            if (!placeholderDocument) {
                throw new AppError("Placeholder document not found", STATUS_CODES.NOT_FOUND);
            }

            if (!detail) {
                throw new AppError("detail is required", STATUS_CODES.BAD_REQUEST);
            }

            detail = detail.trim();
            if (detail.length === 0) {
                throw new AppError("detail cannot be empty", STATUS_CODES.BAD_REQUEST);
            }

            // Upload to IPFS
            console.log(`[DocumentService] Uploading unverified document to IPFS for appointment ${placeholderDocument.appointment_id}`);
            const ipfsResult = await uploadMedicalDocument(buffer, {
                originalName: originalname,
                mimeType: mimetype,
                documentType: VALID_UNVERIFIED_DOCUMENT_TYPES_OBJECT.LAB_TEST,
                patientId: placeholderDocument.patient_id,
                appointmentId: placeholderDocument.appointment_id,
                labTestId: placeholderDocument.lab_test_id,
                isVerified: false,
                uploadedBy: person_id,
            });

            const ipfs_hash = ipfsResult.ipfsHash;
            const file_size = ipfsResult.pinSize;

            // Generate a unique filename for reference
            const filename = `${document_id}-${originalname}`;

            console.log(`[DocumentService] IPFS upload successful - CID: ${ipfs_hash}`);
  
            // Save to database
            const query = {
                text: `UPDATE document
                SET
                original_name = $2,
                file_name = $3,
                mime_type = $4,
                ipfs_hash = $5,
                file_size = $6,
                uploaded_by = $7,
                detail = $8,
                is_verified = $9,
                lab_test_cost = $10
                WHERE
                document_id = $1
                RETURNING *`,
                values: [document_id, originalname, filename, mimetype, ipfs_hash, file_size, person_id, detail, false, 0]
            };
            const result = await DatabaseService.query(query.text, query.values);
            if (result.rowCount === 0) {
                // If DB insert fails, attempt to unpin from IPFS
                try {
                    await unpinFile(ipfs_hash);
                } catch (unpinError) {
                    console.error(`[DocumentService] Failed to unpin IPFS file after DB error: ${unpinError.message}`);
                }
                throw new AppError("Failed to save document information", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            console.log(`[DocumentService] unverified document saved to database with ID: ${document_id}`);
            return result.rows[0];
        } catch (error) {
            console.error(`Error in DocumentService.uploadUnverifiedDocumentAgainstPlaceholder: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Downloads a document file from IPFS if the patient has permission to access it.
     * @param {number} patient_id - The ID of the patient requesting the download.
     * @param {number} document_id - The ID of the document to download.
     * @return {Promise<object>} An object containing the file buffer, MIME type, file size, and original name.
     * @throws {AppError} if any issue occurs
     */
    static async downloadDocument(patient_id, document_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const document = await this.getDocumentIfExists(patient_id, document_id);
            if (!document) {
                throw new AppError("Document not found", STATUS_CODES.NOT_FOUND);
            }

            const ipfsHash = document.ipfs_hash;
            const decryptedCID = decryptCID(ipfsHash);
            if (!decryptedCID) {
                throw new AppError("IPFS hash not found for this document", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            console.log(`[DocumentService] Downloading document from IPFS - CID: ${decryptedCID}`);

            // Fetch file from IPFS
            const fileBuffer = await getBinaryFromIPFS(decryptedCID);

            console.log(`[DocumentService] Document downloaded successfully - Size: ${fileBuffer.length} bytes`);

            return {
                fileBuffer,
                mimeType: document.mime_type,
                fileSize: document.file_size,
                originalName: document.original_name
            };
        } catch (error) {
            console.error(`Error in DocumentService.downloadDocument: ${error.message} ${error.status}`);
            throw error;
        }
    }

    static async exportDocumentsCsv(patient_id, { scope = "all", search = "" } = {}) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const allDocuments = await this.getAllDocumentsIfExists(patient_id, { exportAll: true, limit: 100000 });
            const normalizedScope = this.normalizeExportScope(scope);

            let documents = [];
            if (normalizedScope === "verified") {
                documents = [...(allDocuments?.verified || [])];
            } else if (normalizedScope === "unverified") {
                documents = [...(allDocuments?.unverified || [])];
            } else {
                documents = [
                    ...(allDocuments?.unverified || []),
                    ...(allDocuments?.verified || []),
                ];
            }

            documents = this.filterDocumentsForCsv(documents, search);

            const csvContent = this.buildDocumentsCsvRows(documents);

            return {
                fileBuffer: Buffer.from(csvContent, "utf8"),
                fileName: `documents-export-${normalizedScope}-${new Date().toISOString().slice(0, 10)}.csv`,
            };
        } catch (error) {
            console.error(`Error in DocumentService.exportDocumentsCsv: ${error.message} ${error.status}`);
            throw error;
        }
    }

    /**
     * Deletes a document from database and unpins from IPFS.
     * @param {number} patient_id - The ID of the patient requesting deletion.
     * @param {number} document_id - The ID of the document to delete.
     * @return {Promise<boolean>} True if deletion successful.
     * @throws {AppError} if any issue occurs
     */
    static async deleteDocument(patient_id, document_id) {
        try {
            if (!patient_id) {
                throw new AppError("patient_id is required", STATUS_CODES.BAD_REQUEST);
            }

            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const document = await this.getDocumentIfExists(patient_id, document_id);
            if (!document) {
                throw new AppError("Document not found", STATUS_CODES.NOT_FOUND);
            }

            const ipfsHash = document.ipfs_hash;
            const decryptedCID = decryptCID(ipfsHash);
            if (!decryptedCID) {
                throw new AppError("IPFS hash not found for this document", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            // Delete from database first
            const query = {
                text: `DELETE FROM document WHERE document_id = $1 AND patient_id = $2`,
                values: [document_id, patient_id]
            };
            const result = await DatabaseService.query(query.text, query.values);

            if (result.rowCount === 0) {
                throw new AppError("Failed to delete document", STATUS_CODES.INTERNAL_SERVER_ERROR);
            }

            console.log(`[DocumentService] Document deleted from database: ${document_id}`);

            // Unpin from IPFS (best effort - don't fail if unpin fails)
            if (decryptedCID) {
                try {
                    await unpinFile(decryptedCID);
                    console.log(`[DocumentService] Document unpinned from IPFS: ${decryptedCID}`);
                } catch (unpinError) {
                    console.error(`[DocumentService] Warning: Failed to unpin from IPFS (CID: ${decryptedCID}): ${unpinError.message}`);
                    // Continue - document already deleted from DB
                }
            }

            return true;
        } catch (error) {
            console.error(`Error in DocumentService.deleteDocument: ${error.message} ${error.status}`);
            throw error;
        }
    }
}

module.exports = { DocumentService };