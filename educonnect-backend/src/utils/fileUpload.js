const path = require("path");
const { Readable } = require("stream");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const log = require("./logger");

// Upload file to Cloudinary using best available method
const uploadToCloudinary = async (file, folder, resourceType = "auto") => {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary not configured");
  }

  // Set timeout
  let uploadTimeout;
  const timeoutPromise = new Promise((_, reject) => {
    uploadTimeout = setTimeout(() => {
      reject(new Error("Cloudinary upload timeout - no response after 30s"));
    }, 30000);
  });

  try {
    // Method 1: If file has path (disk storage), use direct upload
    if (file.path) {
      log.info("Uploading to Cloudinary via file path", {
        filename: file.originalname,
        path: file.path,
      });

      const uploadPromise = cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${path.parse(file.originalname || "file").name}`,
      });

      const result = await Promise.race([uploadPromise, timeoutPromise]);
      clearTimeout(uploadTimeout);

      if (!result?.secure_url) {
        throw new Error("Cloudinary returned invalid result - missing secure_url");
      }

      log.info("Cloudinary upload success (file path)", {
        url: result.secure_url,
        publicId: result.public_id,
      });

      return result;
    }

    // Method 2: If file has buffer (memory storage), use stream
    if (file.buffer) {
      log.info("Uploading to Cloudinary via buffer stream", {
        filename: file.originalname,
        bufferSize: file.buffer.length,
      });

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            public_id: `${Date.now()}-${path.parse(file.originalname || "file").name}`,
          },
          (error, result) => {
            if (error) {
              log.error("Cloudinary stream upload failed", {
                error: error.message,
              });
              return reject(error);
            }

            if (!result?.secure_url) {
              return reject(
                new Error("Cloudinary returned invalid result - missing secure_url")
              );
            }

            log.info("Cloudinary upload success (stream)", {
              url: result.secure_url,
              publicId: result.public_id,
            });

            resolve(result);
          }
        );

        uploadStream.on("error", (error) => {
          log.error("Upload stream error", { error: error.message });
          reject(error);
        });

        try {
          Readable.from(file.buffer).pipe(uploadStream);
        } catch (pipeError) {
          log.error("Failed to pipe buffer", { error: pipeError.message });
          reject(pipeError);
        }
      });

      const result = await Promise.race([uploadPromise, timeoutPromise]);
      clearTimeout(uploadTimeout);
      return result;
    }

    throw new Error("File has no path or buffer");
  } catch (error) {
    clearTimeout(uploadTimeout);
    log.error("Cloudinary upload error", {
      filename: file.originalname,
      error: error.message,
    });
    throw error;
  }
};

const getStoredFileReference = async (
  file,
  folder,
  resourceType = "auto",
  options = {}
) => {
  if (!file) return "";

  const { strict = false } = options;

  // Try Cloudinary first if configured
  if (isCloudinaryConfigured) {
    try {
      const result = await uploadToCloudinary(file, folder, resourceType);
      return result.secure_url;
    } catch (error) {
      log.error("Cloudinary upload failed", {
        filename: file.originalname,
        error: error.message,
      });

      if (strict) {
        throw error;
      }

      // Fall through to disk storage as fallback for legacy modules
    }
  } else if (strict) {
    throw new Error("Cloudinary not configured");
  }

  // Fallback: Return filename for disk storage at /uploads/{filename}
  if (!file.filename) {
    log.warn("File has no filename or path for fallback storage", {
      originalname: file.originalname,
    });
    return "";
  }

  log.info("Using disk storage fallback", { filename: file.filename });
  return file.filename;
};

const getStoredFileUrl = async (file, folder, resourceType = "auto") => {
  if (!file) return "";

  // Try Cloudinary first if configured
  if (isCloudinaryConfigured) {
    try {
      const result = await uploadToCloudinary(file, folder, resourceType);
      return result.secure_url;
    } catch (error) {
      log.error("Cloudinary upload failed for URL, falling back", {
        filename: file.originalname,
        error: error.message,
      });
    }
  }

  // Fallback: Return disk storage URL
  return `/uploads/${file.filename || ""}`;
};

module.exports = {
  getStoredFileReference,
  getStoredFileUrl,
  uploadToCloudinary,
  isCloudinaryConfigured,
};
