const { statusCodes } = require("../../utils/statusCodesUtil");
const { DocumentService } = require("../../services/Document/DocumentService");

class DocumentController {
    async getDocuments(req, res) {
        try {
            const { person_id } = req.user;

            const documents = await DocumentService.getDocuments(person_id);

            return res.status(statusCodes.OK).json({
                data: documents,
                message: 'Documents retrieved successfully',
                status: statusCodes.OK,
                success: true
            });
        } catch (error) {
            console.error('Error retrieving documents:', error);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to retrieve documents',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }

    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    data: null,
                    message: 'No file uploaded',
                    status: statusCodes.BAD_REQUEST,
                    success: false
                });
            }

            const { person_id } = req.user;
            const { document_type, uploaded_for, appointment_id, detail, lab_test_id } = req.body;
            const { originalname, filename, mimetype, size } = req.file;
            const filepath = req.file.path;

            let document;
            if (!uploaded_for) {
                    document = await DocumentService.uploadDocument(person_id, {
                    originalname,
                    filename,
                    mimetype,
                    filepath,
                    filesize: size,
                    document_type,
                    detail
                });
            } else {
                document = await DocumentService.uploadDocument(uploaded_for, {
                    originalname,
                    filename,
                    mimetype,
                    filepath,
                    filesize: size,
                    // document_type,
                    detail,
                    uploaded_by: person_id,
                    appointment_id,
                    lab_test_id,
                });
            }

            return res.status(statusCodes.CREATED).json({
                data: document,
                message: 'Document uploaded successfully',
                status: statusCodes.CREATED,
                success: true
            });
        } catch (error) {
            console.error('Error uploading document:', error);
            return res.status(error.status || statusCodes.INTERNAL_SERVER_ERROR).json({
                data: null,
                message: error.message || 'Failed to upload document',
                status: error.status || statusCodes.INTERNAL_SERVER_ERROR,
                success: false
            });
        }
    }
}

module.exports = new DocumentController();