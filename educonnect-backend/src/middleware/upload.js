const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isCloudinaryConfigured } = require("../utils/fileUpload");

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
    return cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_TYPES.all.join(", ")}`), false);
  }

  // Check file size based on type
  const isImage = ALLOWED_TYPES.images.includes(file.mimetype);
  const maxSize = isImage ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.document;

  // Size will be checked by size limit option below
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

module.exports = upload;
