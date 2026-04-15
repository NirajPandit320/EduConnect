const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isCloudinaryConfigured } = require("../utils/fileUpload");
const log = require("../utils/logger");

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!isCloudinaryConfigured && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File type whitelist
const ALLOWED_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  documents: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  all: ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
};

// Storage configuration
const storage = isCloudinaryConfigured
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
      },
    });

// File filter - validate type and size
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!ALLOWED_TYPES.all.includes(file.mimetype)) {
    const error = new Error(`File type not allowed: ${file.mimetype}`);
    log.error("File rejected by type", {
      filename: file.originalname,
      mimetype: file.mimetype
    });
    return cb(error, false);
  }

  // Check file size based on type
  const isImage = ALLOWED_TYPES.images.includes(file.mimetype);
  const maxSize = isImage ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.document;

  if (file.size > maxSize) {
    const error = new Error(`File too large: ${file.originalname}. Max size: ${maxSize / 1024 / 1024}MB`);
    log.error("File rejected by size", {
      filename: file.originalname,
      size: file.size,
      maxSize: maxSize
    });
    return cb(error, false);
  }

  log.info("File accepted by filter", {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    storage: isCloudinaryConfigured ? "cloudinary" : "disk"
  });

  cb(null, true);
};

// Create multer instance with validation
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.image, // Default to image size
    files: 10, // Maximum 10 files per upload
  },
});

// Wrap upload middleware to handle multer errors
const uploadWithErrorHandling = (fieldName, maxFiles) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxFiles);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        log.error("Multer error", {
          code: err.code,
          message: err.message,
          fieldName,
          maxFiles
        });

        // Handle specific multer errors
        if (err.code === "FILE_TOO_LARGE") {
          return res.status(400).json({
            success: false,
            message: `File too large. Max size: ${FILE_SIZE_LIMITS.image / 1024 / 1024}MB`
          });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: `Too many files. Max: ${maxFiles}`
          });
        }

        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }

      if (err) {
        log.error("File filter error", {
          message: err.message,
          fieldName
        });

        return res.status(400).json({
          success: false,
          message: err.message || "File validation failed"
        });
      }

      log.info("Files received successfully", {
        fieldName,
        fileCount: req.files ? req.files.length : 0
      });

      next();
    });
  };
};

// Export both versions
module.exports = upload;
module.exports.withErrorHandling = uploadWithErrorHandling;
