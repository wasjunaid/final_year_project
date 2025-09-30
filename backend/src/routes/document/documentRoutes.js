const express = require('express');
const { uploadDocument, uploadDocumentErrorHandler } = require('../../middlewares/documentMiddleware');
const DocumentController = require("../../controllers/Document/documentController");

const router = express.Router();

router.get(
  '/',
  DocumentController.getDocuments
);

router.post(
  '/upload',
  uploadDocument.single('file'),
  uploadDocumentErrorHandler,
  DocumentController.uploadDocument
);

module.exports = router;