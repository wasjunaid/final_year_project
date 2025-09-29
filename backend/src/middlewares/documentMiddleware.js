const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { statusCodes } = require("../utils/statusCodesUtil");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function(req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

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
            return res.status(statusCodes.BAD_REQUEST).json({
                data: null,
                message: 'File is too large. Maximum file size is 10MB.',
                status: statusCodes.BAD_REQUEST,
                success: false
            });
        }

        return res.status(statusCodes.BAD_REQUEST).json({
            data: null,
            message: err.message,
            status: statusCodes.BAD_REQUEST,
            success: false
        });
    } else if (err) {
        return res.status(statusCodes.BAD_REQUEST).json({
            data: null,
            message: err.message,
            status: statusCodes.BAD_REQUEST,
            success: false
        });
    }

  next();
};

module.exports = { uploadDocument, uploadDocumentErrorHandler };