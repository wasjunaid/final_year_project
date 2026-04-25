// test-imports.js
console.log('Testing imports...');

try {
  const DocumentService = require('./src/services/Document/DocumentService');
  console.log('✅ DocumentService imported:', typeof DocumentService);

  const DocumentController = require('./src/controllers/Document/DocumentController');
  console.log('✅ DocumentController imported:', typeof DocumentController);

  const { uploadDocument } = require('./src/middlewares/documentMiddleware');
  console.log('✅ documentMiddleware imported:', typeof uploadDocument);

  const { uploadToIPFS } = require('./src/utils/ipfs');
  console.log('✅ ipfs utils imported:', typeof uploadToIPFS);

  const { VALID_UNVERIFIED_DOCUMENT_TYPES } = require('./src/utils/validConstantsUtil');
  console.log('✅ validConstants imported:', VALID_UNVERIFIED_DOCUMENT_TYPES);

  console.log('\n✅ All imports successful!');
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error(error.stack);
}