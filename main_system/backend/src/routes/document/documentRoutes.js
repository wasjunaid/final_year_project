const express = require('express');
const { uploadDocument, uploadDocumentErrorHandler } = require('../../middlewares/documentMiddleware');
const DocumentController = require("../../controllers/Document/DocumentController");
const { allowedRoles } = require("../../middlewares/allowedRolesMiddleware");
const { VALID_ROLES_OBJECT: roles } = require("../../validations/auth/authValidations");

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST (before parameterized routes)
router.get(
  '/unverified',
  allowedRoles([roles.PATIENT]),
  DocumentController.getAllUnverifiedDocumentsIfExists
);

router.get(
  '/verified',
  allowedRoles([roles.PATIENT]),
  DocumentController.getAllVerifiedDocumentsIfExists
);

router.get(
  '/all',
  allowedRoles([roles.PATIENT]),
  DocumentController.getAllDocumentsIfExists
);

router.get(
  "/appointment",
  allowedRoles([roles.PATIENT]),
  DocumentController.getAllVerifiedDocumentsAgainstAppointmentIfExists
);

router.get(
  '/download/:document_id',
  allowedRoles([roles.PATIENT]),
  DocumentController.downloadDocument
);

router.get(
  '/export/csv',
  allowedRoles([roles.PATIENT]),
  DocumentController.exportDocumentsCsv
);

router.get(
  '/placeholders-for-patient',
  allowedRoles([roles.PATIENT]),
  DocumentController.getPlaceholdersForLabTestDocumentsForPatient
);

router.get(
  '/placeholders-for-lab-tech',
  allowedRoles([roles.HOSPITAL_LAB_TECHNICIAN]),
  DocumentController.getPlaceholdersForLabTestDocumentsForLabTech
);

router.post(
  '/placeholder',
  allowedRoles([roles.DOCTOR]),
  DocumentController.insertPlaceholderForLabTestDocument
)

router.get(
  '/placeholders-for-patient',
  allowedRoles([roles.PATIENT]),
  DocumentController.getPlaceholdersForLabTestDocumentsForPatient
);

router.get(
  '/placeholders-for-lab-tech',
  allowedRoles([roles.HOSPITAL_LAB_TECHNICIAN]),
  DocumentController.getPlaceholdersForLabTestDocumentsForLabTech
);

router.get(
  '/:document_id',
  allowedRoles([roles.PATIENT]),
  DocumentController.getDocumentIfExists
);

router.delete(
  '/:document_id',
  allowedRoles([roles.PATIENT]),
  DocumentController.deleteDocument
);

router.post(
  '/upload/unverified',
  allowedRoles([roles.PATIENT]),
  uploadDocument.single('file'),
  uploadDocumentErrorHandler,
  DocumentController.uploadUnverifiedDocument
);

router.put(
  '/upload/verified/:document_id',
  allowedRoles([roles.HOSPITAL_LAB_TECHNICIAN]),
  uploadDocument.single('file'),
  uploadDocumentErrorHandler,
  DocumentController.uploadVerifiedDocumentAgainstPlaceholder
);

router.put(
  '/upload/unverified/:document_id',
  allowedRoles([roles.PATIENT]),
  uploadDocument.single('file'),
  uploadDocumentErrorHandler,
  DocumentController.uploadUnverifiedDocumentAgainstPlaceholder
);

module.exports = router;