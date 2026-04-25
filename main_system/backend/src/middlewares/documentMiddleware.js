const multer = require('multer');
const { STATUS_CODES } = require("../utils/statusCodesUtil");  // ✅ FIXED: Changed from statusCodes to STATUS_CODES

// Use memory storage instead of disk storage for IPFS upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [ 'application/pdf' ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF is allowed.'), false);
  }
};

const uploadDocument = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  }
});

const uploadDocumentErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(STATUS_CODES.BAD_REQUEST).json({  // ✅ FIXED
                data: null,
                message: 'File is too large. Maximum file size is 100MB.',
                status: STATUS_CODES.BAD_REQUEST,  // ✅ FIXED
                success: false
            });
        }

        return res.status(STATUS_CODES.BAD_REQUEST).json({  // ✅ FIXED
            data: null,
            message: err.message,
            status: STATUS_CODES.BAD_REQUEST,  // ✅ FIXED
            success: false
        });
    } else if (err) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({  // ✅ FIXED
            data: null,
            message: err.message,
            status: STATUS_CODES.BAD_REQUEST,  // ✅ FIXED
            success: false
        });
    }

  next();
};

module.exports = { uploadDocument, uploadDocumentErrorHandler };