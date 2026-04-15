const path = require("path");
const { Readable } = require("stream");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const log = require("./logger");

const uploadBufferToCloudinary = (file, folder, resourceType = "auto") =>
  new Promise((resolve, reject) => {
    // Set timeout for upload (30 seconds)
    const uploadTimeout = setTimeout(() => {
      reject(new Error("Cloudinary upload timeout - no response after 30s"));
    }, 30000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${path.parse(file.originalname || "file").name}`,
      },
      (error, result) => {
        clearTimeout(uploadTimeout);

        if (error) {
          log.error("Cloudinary upload failed", {
            folder,
            filename: file.originalname,
            error: error.message
          });
          reject(error);
          return;
        }

        if (!result || !result.secure_url) {
          reject(new Error("Cloudinary returned invalid result"));
          return;
        }

        log.info("Cloudinary upload success", {
          folder,
          publicId: result.public_id,
          url: result.secure_url
        });

        resolve(result);
      }
    );

    // Handle stream errors
    uploadStream.on("error", (error) => {
      clearTimeout(uploadTimeout);
      log.error("Upload stream error", {
        filename: file.originalname,
        error: error.message
      });
      reject(error);
    });

    // Pipe buffer to stream
    try {
      Readable.from(file.buffer).pipe(uploadStream);
    } catch (pipeError) {
      clearTimeout(uploadTimeout);
      log.error("Failed to pipe file to upload stream", {
        filename: file.originalname,
        error: pipeError.message
      });
      reject(pipeError);
    }
  });

const getStoredFileReference = async (file, folder, resourceType = "auto") => {
  if (!file) return "";

  if (isCloudinaryConfigured) {
    try {
      const result = await uploadBufferToCloudinary(file, folder, resourceType);
      return result.secure_url;
    } catch (error) {
      log.error("Failed to get Cloudinary reference", {
        filename: file.originalname,
        error: error.message
      });
      throw error;
    }
  }

  // Fallback to disk storage
  return file.filename || "";
};

const getStoredFileUrl = async (file, folder, resourceType = "auto") => {
  if (!file) return "";

  if (isCloudinaryConfigured) {
    try {
      const result = await uploadBufferToCloudinary(file, folder, resourceType);
      return result.secure_url;
    } catch (error) {
      log.error("Failed to get Cloudinary URL", {
        filename: file.originalname,
        error: error.message
      });
      throw error;
    }
  }

  // Fallback to disk storage URL
  return `/uploads/${file.filename}`;
};

module.exports = {
  getStoredFileReference,
  getStoredFileUrl,
  isCloudinaryConfigured,
};
