const { STATUS_CODES } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../classes/AppErrorClass");
const  { DocumentService }  = require("../../services/Document/DocumentService");
const { VALID_UNVERIFIED_DOCUMENT_TYPES } = require("../../utils/validConstantsUtil");
const { validateID } = require("../../utils/idUtil");

const extractDocumentListQuery = (req) => {
    const { search = "", page, limit } = req.query || {};
    return { search, page, limit };
};

class DocumentController {
    async getDocumentIfExists(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const { document_id } = req.params;

            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedDocumentID = document_id;

            const document = await DocumentService.getDocumentIfExists(person_id, validatedDocumentID);

            return res.status(STATUS_CODES.OK).json({
                data: document,
                message: "Document retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.getDocumentIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllUnverifiedDocumentsIfExists(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const queryOptions = extractDocumentListQuery(req);

            const documents = await DocumentService.getAllUnverifiedDocumentsIfExists(person_id, queryOptions);

            return res.status(STATUS_CODES.OK).json({
                data: documents.rows,
                pagination: documents.pagination,
                message: documents.rows.length > 0 ? "Unverified documents retrieved successfully" : "No unverified documents found",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.getAllUnverifiedDocumentsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllVerifiedDocumentsIfExists(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const queryOptions = extractDocumentListQuery(req);

            const documents = await DocumentService.getAllVerifiedDocumentsIfExists(person_id, queryOptions);

            return res.status(STATUS_CODES.OK).json({
                data: documents.rows,
                pagination: documents.pagination,
                message: documents.rows.length > 0 ? "Verified documents retrieved successfully" : "No verified documents found",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.getAllVerifiedDocumentsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllDocumentsIfExists(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const queryOptions = extractDocumentListQuery(req);

            const documents = await DocumentService.getAllDocumentsIfExists(person_id, queryOptions);

            const unverified = Array.isArray(documents?.unverified) ? documents.unverified : [];
            const verified = Array.isArray(documents?.verified) ? documents.verified : [];
            const pagination = documents?.pagination || null;
            const totalDocuments = unverified.length + verified.length;

            return res.status(STATUS_CODES.OK).json({
                data: {
                    unverified,
                    verified,
                    pagination,
                },
                message: totalDocuments > 0 ? "Documents retrieved successfully" : "No documents found",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.getAllDocumentsIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllVerifiedDocumentsAgainstAppointmentIfExists(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const { appointment_id } = req.query;

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedAppointmentID = validateID(appointment_id);

            const documents = await DocumentService.getAllVerifiedDocumentsAgainstAppointmentIfExists(person_id, validatedAppointmentID);
            if (!documents) {
                throw new AppError("No documents found for this appointment", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: documents,
                message: "Documents retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.getAllVerifiedDocumentsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getAllUnverifiedDocumentsAgainstAppointmentIfExists(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const { appointment_id } = req.query;

            if (!appointment_id) {
                throw new AppError("appointment_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedAppointmentID = validateID(appointment_id);

            const documents = await DocumentService.getAllUnverifiedDocumentsAgainstAppointmentIfExists(person_id, validatedAppointmentID);
            if (!documents) {
                throw new AppError("No documents found for this appointment", STATUS_CODES.NOT_FOUND);
            }

            return res.status(STATUS_CODES.OK).json({
                data: documents,
                message: "Documents retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.getAllUnverifiedDocumentsAgainstAppointmentIfExists: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPlaceholdersForLabTestDocumentsForLabTech(req, res) {
        try {
            const { person_id } = req.user;

            const placeholders = await DocumentService.getPlaceholdersForLabTestDocumentsForLabTech(person_id);

            return res.status(STATUS_CODES.OK).json({
                data: placeholders,
                message: "Placeholders retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        }   catch (error) {
            console.error(`Error in DocumentController.getPlaceholdersForLabTestDocumentsForLabTech: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async getPlaceholdersForLabTestDocumentsForPatient(req, res) {
        try {
            const { person_id } = req.user;

            const placeholders = await DocumentService.getPlaceholdersForLabTestDocumentsForPatient(person_id);

            return res.status(STATUS_CODES.OK).json({
                data: placeholders,
                message: "Placeholders retrieved successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        }   catch (error) {
            console.error(`Error in DocumentController.getPlaceholdersForLabTestDocuments: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async insertPlaceholderForLabTestDocument(req, res) {
        try {
            const { person_id } = req.user;  // From JWT token
            const { patient_id, lab_test_id, appointment_id } = req.body;

            const result = await DocumentService.insertPlaceholderForLabTestDocument({
                patient_id,
                lab_test_id,
                appointment_id
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: result,
                message: "Placeholder inserted successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.insertPlaceholderForLabTestDocument: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async uploadUnverifiedDocument(req, res) {
        try {
            // Extract file from multer (req.file)
            if (!req.file) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: "No file uploaded",
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            // ✅ FIXED: Get patient_id from JWT token only (person_id IS the patient_id)
            const { person_id } = req.user;  // From JWT token - this is the patient ID
            
            if (!person_id) {
                throw new AppError("Authentication required", STATUS_CODES.UNAUTHORIZED);
            }

            // Get file data from multer
            const buffer = req.file.buffer;           // File buffer from memoryStorage
            const originalname = req.file.originalname; // Original filename
            const mimetype = req.file.mimetype;        // MIME type
            const size = req.file.size;                // File size in bytes

            // Get document metadata from req.body
            const { document_type, detail } = req.body;

            // Validate required fields
            if (!document_type) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: "document_type is required",
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            if (!detail) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: "detail is required",
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            // Call service with correct parameters
            const result = await DocumentService.uploadUnverifiedDocument({
                patient_id: person_id,  // ✅ Use person_id from JWT as patient_id
                buffer,           
                originalname,     
                mimetype,         
                size,             
                document_type,    
                detail           
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: result,
                message: "Document uploaded successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.uploadUnverifiedDocument: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async uploadVerifiedDocumentAgainstPlaceholder(req, res) {
        console.log("I am in verified doc");
        try {
            // Extract file from multer
            if (!req.file) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: "No file uploaded",
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            // ✅ FIXED: Get person_id from JWT token ONLY (no fallback to body)
            const { person_id } = req.user;  // From JWT token
            
            if (!person_id) {
                throw new AppError("Authentication required", STATUS_CODES.UNAUTHORIZED);
            }

            // Get file data from multer
            const buffer = req.file.buffer;
            const originalname = req.file.originalname;
            const mimetype = req.file.mimetype;
            const size = req.file.size;

            // Get document metadata from req.body
            const { detail } = req.body;
            const { document_id } = req.params;

            if (!detail) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: "detail is required",
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            // Call service with correct parameters
            const result = await DocumentService.uploadVerifiedDocumentAgainstPlaceholder({
                document_id,  // New document
                person_id,  // ✅ From JWT token only
                buffer,
                originalname,
                mimetype,
                size,
                detail
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: result,
                message: "Verified document uploaded successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.uploadVerifiedDocumentAgainstPlaceholder: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async uploadUnverifiedDocumentAgainstPlaceholder(req, res) {
        console.log("I am in unverified doc against placeholder");
        try {
            // Extract file from multer
            if (!req.file) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: "No file uploaded",
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            // ✅ FIXED: Get person_id from JWT token ONLY (no fallback to body)
            const { person_id } = req.user;  // From JWT token
            
            if (!person_id) {
                throw new AppError("Authentication required", STATUS_CODES.UNAUTHORIZED);
            }

            // Get file data from multer
            const buffer = req.file.buffer;
            const originalname = req.file.originalname;
            const mimetype = req.file.mimetype;
            const size = req.file.size;

            // Get document metadata from req.body
            const { detail } = req.body;
            const { document_id } = req.params;

            if (!detail) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    data: null,
                    message: "detail is required",
                    status: STATUS_CODES.BAD_REQUEST,
                    success: false
                });
            }

            // Call service with correct parameters
            const result = await DocumentService.uploadVerifiedDocumentAgainstPlaceholder({
                document_id,  // New document
                person_id,  // ✅ From JWT token only
                buffer,
                originalname,
                mimetype,
                size,
                detail
            });

            return res.status(STATUS_CODES.CREATED).json({
                data: result,
                message: "Unverified document against placeholder uploaded successfully",
                status: STATUS_CODES.CREATED,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.uploadUnverifiedDocumentAgainstPlaceholder: ${error.message}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message,
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async downloadDocument(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const { document_id } = req.params;

            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedDocumentID = document_id;

            const document = await DocumentService.downloadDocument(person_id, validatedDocumentID);

            res.setHeader('Content-Type', document.mimeType);
            res.setHeader('Content-Length', document.fileSize);
            res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);

            res.send(document.fileBuffer);
        } catch (error) {
            console.error(`Error in DocumentController.downloadDocument: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async exportDocumentsCsv(req, res) {
        try {
            const { person_id } = req.user;
            const { scope = "all", search = "" } = req.query;

            const csvFile = await DocumentService.exportDocumentsCsv(person_id, { scope, search });

            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="${csvFile.fileName}"`);

            return res.send(csvFile.fileBuffer);
        } catch (error) {
            console.error(`Error in DocumentController.exportDocumentsCsv: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async deleteDocument(req, res) {
        try {
            const { person_id } = req.user;  // ✅ From JWT token
            const { document_id } = req.params;

            if (!document_id) {
                throw new AppError("document_id is required", STATUS_CODES.BAD_REQUEST);
            }

            const validatedDocumentID = document_id;

            await DocumentService.deleteDocument(person_id, validatedDocumentID);

            return res.status(STATUS_CODES.OK).json({
                data: null,
                message: "Document deleted successfully",
                status: STATUS_CODES.OK,
                success: true
            });
        } catch (error) {
            console.error(`Error in DocumentController.deleteDocument: ${error.message} ${error.status}`);
            return res.status(error.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || "Internal Server Error",
                status: error.status || STATUS_CODES.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new DocumentController();