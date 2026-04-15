const path = require("path");
const { Readable } = require("stream");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const uploadBufferToCloudinary = (file, folder, resourceType = "auto") =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${path.parse(file.originalname || "file").name}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

const getStoredFileReference = async (file, folder, resourceType = "auto") => {
  if (!file) return "";

  if (isCloudinaryConfigured) {
    const result = await uploadBufferToCloudinary(file, folder, resourceType);
    return result.secure_url;
  }

  return file.filename || "";
};

const getStoredFileUrl = async (file, folder, resourceType = "auto") => {
  if (!file) return "";

  if (isCloudinaryConfigured) {
    const result = await uploadBufferToCloudinary(file, folder, resourceType);
    return result.secure_url;
  }

  return `/uploads/${file.filename}`;
};

module.exports = {
  getStoredFileReference,
  getStoredFileUrl,
  isCloudinaryConfigured,
};
