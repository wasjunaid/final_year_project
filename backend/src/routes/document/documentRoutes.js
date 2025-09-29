const express = require('express');
const { uploadDocument, uploadDocumentErrorHandler } = require('../../middlewares/documentMiddleware');
const DocumentController = require("../../controllers/Document/documentController");

const router = express.Router();

router.get(
  '/',
  DocumentController.getDocuments
);

// router.get('/:document_id', getDocumentByIdFunction);

router.post(
  '/upload',
  uploadDocument.single('file'),
  uploadDocumentErrorHandler,
  DocumentController.uploadDocument
);

// router.delete('/:document_id', deleteDocumentFunction);

module.exports = router;