const Resource = require("../models/Resource");
const User = require("../models/User");
const { sendSuccess, sendError, sendValidationError } = require("../utils/response");
const { sanitizeText, validateRequiredFields } = require("../utils/validators");
const log = require("../utils/logger");
const { getStoredFileUrl } = require("../utils/fileUpload");

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags !== "string") return [];

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const parseAllowedUsers = (allowedUsers) => {
  if (!allowedUsers) return [];

  if (Array.isArray(allowedUsers)) {
    return [...new Set(allowedUsers.map((uid) => String(uid).trim()).filter(Boolean))];
  }

  if (typeof allowedUsers === "string") {
    try {
      const parsed = JSON.parse(allowedUsers);
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.map((uid) => String(uid).trim()).filter(Boolean))];
      }
    } catch (error) {
      return [...new Set(allowedUsers.split(",").map((uid) => uid.trim()).filter(Boolean))];
    }
  }

  return [];
};

const canAccessResource = (resource, uid) => {
  if (resource.visibility === "public") return true;
  if (!uid) return false;

  return resource.uploadedBy === uid || (resource.allowedUsers || []).includes(uid);
};

const toPublicResource = async (resource, viewerUid) => {
  const uploader = await User.findOne({ uid: resource.uploadedBy }).select("name email");
  const isOwner = viewerUid && resource.uploadedBy === viewerUid;
  const hasAccess = canAccessResource(resource, viewerUid);

  return {
    ...resource.toObject(),
    uploaderName: uploader?.name || uploader?.email || "Unknown",
    likeCount: resource.likes.length,
    bookmarkCount: resource.bookmarks.length,
    commentCount: resource.comments.length,
    hasAccess,
    allowedUsers: isOwner ? resource.allowedUsers || [] : undefined,
  };
};

/**
 * UPLOAD RESOURCE - Create new resource with file or URL
 */
exports.uploadResource = async (req, res) => {
  try {
    const {
      title,
      description,
      fileUrl,
      uploaderUid,
      tags,
      visibility,
      resourceType,
      category,
      allowedUsers,
    } = req.body;

    // Validation
    const errors = validateRequiredFields(
      { title, uploaderUid },
      ["title", "uploaderUid"]
    );
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    // Verify uploader exists
    const uploader = await User.findOne({ uid: uploaderUid });
    if (!uploader) {
      return sendError(res, "User not found", 404);
    }

    const parsedTags = parseTags(tags);
    const parsedAllowedUsers = parseAllowedUsers(allowedUsers);
    const files = req.files || [];

    if (!fileUrl && files.length === 0) {
      return sendValidationError(res, "Provide at least one file or resource URL");
    }

    const payload = [];

    if (fileUrl) {
      payload.push({
        title: title.trim(),
        description: sanitizeText(description || ""),
        fileUrl,
        uploadedBy: uploaderUid,
        tags: parsedTags,
        visibility: visibility || "public",
        allowedUsers: visibility === "private" ? parsedAllowedUsers : [],
        resourceType: resourceType || "link",
        category: category || "notes",
      });
    }

    for (const file of files) {
      const storedFileUrl = await getStoredFileUrl(file, "educonnect/resources", "auto");

      payload.push({
        title: files.length > 1 ? `${title.trim()} (${file.originalname})` : title.trim(),
        description: sanitizeText(description || ""),
        fileUrl: storedFileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: uploaderUid,
        tags: parsedTags,
        visibility: visibility || "public",
        allowedUsers: visibility === "private" ? parsedAllowedUsers : [],
        resourceType: resourceType || "file",
        category: category || "notes",
      });
    }

    const created = await Resource.insertMany(payload);
    const data = await Promise.all(created.map((resource) => toPublicResource(resource, uploaderUid)));

    log.info("Resource uploaded", { uploaderUid, resourceCount: created.length });
    return sendSuccess(res, data, "Resource uploaded successfully", 201);
  } catch (error) {
    log.error("Upload resource error", error);
    return sendError(res, "Upload failed", 500);
  }
};

/**
 * GET RESOURCES - List with filtering, sorting, and pagination
 */
exports.getResources = async (req, res) => {
  try {
    const {
      q,
      tag,
      uploader,
      sort = "recent",
      visibility,
      uid,
      page = 1,
      limit = 10,
    } = req.query;

    const accessFilter = !uid
      ? { visibility: "public" }
      : {
          $or: [
            { visibility: "public" },
            { uploadedBy: uid },
            { allowedUsers: uid },
          ],
        };

    const filterParts = [];

    if (visibility === "public") {
      filterParts.push({ visibility: "public" });
    } else if (visibility === "private") {
      if (!uid) {
        return sendSuccess(res, { resources: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } }, "No private resources");
      }

      filterParts.push({
        visibility: "private",
        $or: [{ uploadedBy: uid }, { allowedUsers: uid }],
      });
    } else {
      filterParts.push(accessFilter);
    }

    if (uploader) {
      filterParts.push({ uploadedBy: uploader });
    }

    if (tag) {
      filterParts.push({ tags: { $in: [tag] } });
    }

    if (q) {
      filterParts.push({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
        ],
      });
    }

    let sortBy = { createdAt: -1 };

    if (sort === "popular") {
      sortBy = { likes: -1, viewCount: -1, createdAt: -1 };
    }

    if (sort === "trending") {
      sortBy = { downloadCount: -1, viewCount: -1, createdAt: -1 };
    }

    const query = filterParts.length ? { $and: filterParts } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const resources = await Resource.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(query);

    const data = await Promise.all(resources.map((resource) => toPublicResource(resource, uid)));

    log.info("Resources fetched", { uid, resourceCount: data.length, total });
    return sendSuccess(
      res,
      {
        resources: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Resources retrieved successfully"
    );
  } catch (error) {
    log.error("Get resources error", error);
    return sendError(res, "Fetch failed", 500);
  }
};

/**
 * UPDATE RESOURCE - Modify resource (owner only)
 */
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, title, description, visibility, tags, category, allowedUsers } = req.body;

    // Validation
    if (!uid || !id) {
      return sendValidationError(res, "User ID and Resource ID required");
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Authorization - only owner can edit
    if (resource.uploadedBy !== uid) {
      return sendError(res, "Not allowed to edit this resource", 403);
    }

    // Update fields if provided
    if (title !== undefined) resource.title = title.trim();
    if (description !== undefined) resource.description = sanitizeText(description);
    if (visibility !== undefined) resource.visibility = visibility;
    if (category !== undefined) resource.category = category;
    if (tags !== undefined) resource.tags = parseTags(tags);
    if (allowedUsers !== undefined) {
      resource.allowedUsers = parseAllowedUsers(allowedUsers);
    }

    // Public resources have no allowed list
    if (visibility === "public") {
      resource.allowedUsers = [];
    }

    // Handle file update
    if (req.file) {
      resource.fileUrl = await getStoredFileUrl(req.file, "educonnect/resources", "auto");
      resource.fileName = req.file.originalname;
      resource.fileSize = req.file.size;
      resource.mimeType = req.file.mimetype;
      resource.resourceType = "file";
      resource.version = (resource.version || 0) + 1;
    }

    await resource.save();

    log.info("Resource updated", { resourceId: id, uid });
    return sendSuccess(res, await toPublicResource(resource, uid), "Resource updated successfully");
  } catch (error) {
    log.error("Update resource error", error);
    return sendError(res, "Update failed", 500);
  }
};

/**
 * DELETE RESOURCE - Remove resource (owner only)
 */
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    // Validation
    if (!uid || !id) {
      return sendValidationError(res, "User ID and Resource ID required");
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Authorization - only owner can delete
    if (resource.uploadedBy !== uid) {
      return sendError(res, "Not allowed to delete this resource", 403);
    }

    await Resource.findByIdAndDelete(id);

    log.info("Resource deleted", { resourceId: id, uid });
    return sendSuccess(res, { deletedResourceId: id }, "Resource deleted successfully");
  } catch (error) {
    log.error("Delete resource error", error);
    return sendError(res, "Delete failed", 500);
  }
};

/**
 * TOGGLE LIKE - Add/remove like on resource
 */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    // Validation
    if (!uid || !id) {
      return sendValidationError(res, "User ID and Resource ID required");
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Access check
    if (!canAccessResource(resource, uid)) {
      return sendError(res, "You do not have access to this resource", 403);
    }

    const alreadyLiked = resource.likes.includes(uid);

    if (alreadyLiked) {
      resource.likes = resource.likes.filter((likeUid) => likeUid !== uid);
    } else {
      resource.likes.push(uid);
    }

    await resource.save();

    log.info("Resource like toggled", { resourceId: id, uid, liked: !alreadyLiked });
    return sendSuccess(
      res,
      await toPublicResource(resource, uid),
      alreadyLiked ? "Unliked successfully" : "Liked successfully"
    );
  } catch (error) {
    log.error("Toggle like error", error);
    return sendError(res, "Like update failed", 500);
  }
};

/**
 * TOGGLE BOOKMARK - Add/remove bookmark on resource
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    // Validation
    if (!uid || !id) {
      return sendValidationError(res, "User ID and Resource ID required");
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Access check
    if (!canAccessResource(resource, uid)) {
      return sendError(res, "You do not have access to this resource", 403);
    }

    const alreadyBookmarked = resource.bookmarks.includes(uid);

    if (alreadyBookmarked) {
      resource.bookmarks = resource.bookmarks.filter((bookmarkUid) => bookmarkUid !== uid);
    } else {
      resource.bookmarks.push(uid);
    }

    await resource.save();

    log.info("Resource bookmark toggled", { resourceId: id, uid, bookmarked: !alreadyBookmarked });
    return sendSuccess(
      res,
      await toPublicResource(resource, uid),
      alreadyBookmarked ? "Bookmark removed successfully" : "Bookmarked successfully"
    );
  } catch (error) {
    log.error("Toggle bookmark error", error);
    return sendError(res, "Bookmark update failed", 500);
  }
};

/**
 * ADD COMMENT - Add comment to resource (access check)
 */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, text } = req.body;

    // Validation
    const errors = validateRequiredFields({ uid, text }, ["uid", "text"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Access check
    if (!canAccessResource(resource, uid)) {
      return sendError(res, "You do not have access to this resource", 403);
    }

    // Sanitize comment text
    const sanitizedText = sanitizeText(text);

    resource.comments.push({ uid, text: sanitizedText });
    await resource.save();

    log.info("Comment added", { resourceId: id, uid });
    return sendSuccess(res, await toPublicResource(resource, uid), "Comment added successfully", 201);
  } catch (error) {
    log.error("Add comment error", error);
    return sendError(res, "Comment failed", 500);
  }
};

/**
 * REPORT RESOURCE - Report inappropriate resource
 */
exports.reportResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, reason } = req.body;

    // Validation
    const errors = validateRequiredFields({ uid }, ["uid"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Access check
    if (!canAccessResource(resource, uid)) {
      return sendError(res, "You do not have access to this resource", 403);
    }

    resource.reports.push({
      uid,
      reason: sanitizeText(reason || ""),
    });
    await resource.save();

    log.info("Resource reported", { resourceId: id, uid, reason });
    return sendSuccess(res, { reportId: resource._id }, "Resource reported successfully");
  } catch (error) {
    log.error("Report resource error", error);
    return sendError(res, "Report failed", 500);
  }
};

/**
 * INCREMENT VIEW - Track resource views
 */
exports.incrementView = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body || {};

    if (!id) {
      return sendValidationError(res, "Resource ID required");
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Access check
    if (!canAccessResource(resource, uid)) {
      return sendError(res, "You do not have access to this resource", 403);
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    log.info("View incremented", { resourceId: id, uid });
    return sendSuccess(res, { viewCount: updatedResource.viewCount }, "View counted successfully");
  } catch (error) {
    log.error("Increment view error", error);
    return sendError(res, "View count failed", 500);
  }
};

/**
 * INCREMENT DOWNLOAD - Track resource downloads
 */
exports.incrementDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body || {};

    if (!id) {
      return sendValidationError(res, "Resource ID required");
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return sendError(res, "Resource not found", 404);
    }

    // Access check
    if (!canAccessResource(resource, uid)) {
      return sendError(res, "You do not have access to this resource", 403);
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    log.info("Download incremented", { resourceId: id, uid });
    return sendSuccess(res, { downloadCount: updatedResource.downloadCount }, "Download counted successfully");
  } catch (error) {
    log.error("Increment download error", error);
    return sendError(res, "Download count failed", 500);
  }
};
