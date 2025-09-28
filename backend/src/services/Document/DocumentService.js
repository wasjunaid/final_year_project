const { UnverifiedDocumentService } = require("./UnverifiedDocumentService");
const { VerifiedDocumentService } = require("./VerifiedDocumentService");
const path = require("path");
const fs = require("fs");
const { statusCodes } = require("../../utils/statusCodesUtil");
const { AppError } = require("../../utils/AppErrorUtil");

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class DocumentService {
    static async getDocuments(person_id) {
        if (!person_id) {
            throw new AppError("person_id is required", statusCodes.BAD_REQUEST);
        }

        try {
            const unverifiedDocsResult = await UnverifiedDocumentService.getUnverifiedDocuments(person_id);
            const verifiedDocsResult = await VerifiedDocumentService.getVerifiedDocuments(person_id);

            return {
                verified_documents: verifiedDocsResult,
                unverified_documents: unverifiedDocsResult
            };
        } catch (error) {
            throw new AppError(`error getting documents ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    static async uploadDocument(person_id, {
            original_name,
            file_name,
            mimetype,
            file_path,
            file_size,
            document_type,
            detail,
            uploaded_by = -1,
            appointment_id = -1,
            lab_test_id = -1
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
        if (!detail) {
            throw new AppError("detail is required", statusCodes.BAD_REQUEST);
        }

        try {
            let result;
            if (uploaded_by !== -1 || appointment_id !== -1 || lab_test_id !== -1) {
                result = await VerifiedDocumentService.uploadVerifiedDocument(person_id, {
                    original_name,
                    file_name,
                    mimetype,
                    file_path,
                    file_size,
                    document_type,
                    uploaded_by,
                    appointment_id,
                    detail
                });
            } else {
                result = await UnverifiedDocumentService.uploadUnverifiedDocument(person_id, {
                    original_name,
                    file_name,
                    mimetype,
                    file_path,
                    file_size,
                    document_type,
                    detail
                });
            }

            return result;
        } catch (error) {
            throw new AppError(`error uploading document: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = { DocumentService };

// const uploadDocumentFunction = async (req, res) => {
//   try {

//     const { person_id, role } = req.user;
//     const { originalname, filename, mimetype, size } = req.file;
//     const filePath = req.file.path;

//     const document = await DocumentService.uploadDocument({
//       originalname,
//       filename,
//       mimetype,
//       size,
//       filePath,
//       person_id
//     });

//     return res.status(201).json({
//       success: true,
//       message: 'Document uploaded successfully',
//       data: document,
//       status: 201
//     });
//   } catch (error) {
//     console.error('Error uploading document:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to upload document',
//       error: error.message,
//       data: null,
//       status: 500
//     });
//   }
// };

// // Get document by ID
// const getDocumentByIdFunction = async (req, res) => {
//   try {
//     const { document_id } = req.params;
//     const { person_id } = req.user;
    
//     const query = `
//       SELECT * FROM document 
//       WHERE document_id = $1 AND person_id = $2
//     `;
    
//     const result = await pool.query(query, [document_id, person_id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Document not found',
//         data: null,
//         status: 404
//       });
//     }
    
//     const document = result.rows[0];
    
//     // Stream the file to the client
//     const filePath = document.file_path;
    
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({
//         success: false,
//         message: 'Document file not found',
//         data: null,
//         status: 404
//       });
//     }
    
//     res.setHeader('Content-Type', document.mime_type);
//     res.setHeader('Content-Disposition', `inline; filename="${document.original_name}"`);
    
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   } catch (error) {
//     console.error('Error retrieving document:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve document',
//       error: error.message,
//       data: null,
//       status: 500
//     });
//   }
// };

// // Delete document by ID
// const deleteDocumentFunction = async (req, res) => {
//   try {
//     const { document_id } = req.params;
//     const { person_id } = req.user;
    
//     // Get the document to check if it exists and get the file path
//     const getQuery = `
//       SELECT * FROM document
//       WHERE document_id = $1 AND person_id = $2
//     `;
    
//     const getResult = await pool.query(getQuery, [document_id, person_id]);
    
//     if (getResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Document not found',
//         data: null,
//         status: 404
//       });
//     }
    
//     const document = getResult.rows[0];
    
//     // Delete from database
//     const deleteQuery = `
//       DELETE FROM document
//       WHERE document_id = $1
//     `;
    
//     await pool.query(deleteQuery, [document_id]);
    
//     // Delete file from disk
//     if (fs.existsSync(document.file_path)) {
//       fs.unlinkSync(document.file_path);
//     }
    
//     return res.status(200).json({
//       success: true,
//       message: 'Document deleted successfully',
//       data: null,
//       status: 200
//     });
//   } catch (error) {
//     console.error('Error deleting document:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to delete document',
//       error: error.message,
//       data: null,
//       status: 500
//     });
//   }
// };