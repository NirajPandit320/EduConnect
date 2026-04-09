const Resource = require("../models/Resource");
const User = require("../models/User");

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

    if (!title || !uploaderUid) {
      return res.status(400).json({
        message: "title and uploaderUid are required",
      });
    }

    const parsedTags = parseTags(tags);
    const parsedAllowedUsers = parseAllowedUsers(allowedUsers);
    const files = req.files || [];

    if (!fileUrl && files.length === 0) {
      return res.status(400).json({
        message: "Provide at least one file or resource URL",
      });
    }

    const payload = [];

    if (fileUrl) {
      payload.push({
        title,
        description,
        fileUrl,
        uploadedBy: uploaderUid,
        tags: parsedTags,
        visibility: visibility || "public",
        allowedUsers: visibility === "private" ? parsedAllowedUsers : [],
        resourceType: resourceType || "link",
        category: category || "notes",
      });
    }

    files.forEach((file) => {
      payload.push({
        title: files.length > 1 ? `${title} (${file.originalname})` : title,
        description,
        fileUrl: `/uploads/${file.filename}`,
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
    });

    const created = await Resource.insertMany(payload);
    const data = await Promise.all(created.map((resource) => toPublicResource(resource, uploaderUid)));

    res.status(201).json({
      message: "Resource uploaded successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};

exports.getResources = async (req, res) => {
  try {
    const {
      q,
      tag,
      uploader,
      sort = "recent",
      visibility,
      uid,
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
        return res.json([]);
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

    const resources = await Resource.find(query).sort(sortBy);
    const data = await Promise.all(resources.map((resource) => toPublicResource(resource, uid)));

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Fetch failed",
      error: error.message,
    });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, title, description, visibility, tags, category, allowedUsers } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (uid && resource.uploadedBy !== uid) {
      return res.status(403).json({ message: "Not allowed to edit this resource" });
    }

    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (visibility !== undefined) resource.visibility = visibility;
    if (category !== undefined) resource.category = category;
    if (tags !== undefined) resource.tags = parseTags(tags);
    if (allowedUsers !== undefined) {
      resource.allowedUsers = parseAllowedUsers(allowedUsers);
    }

    if (visibility === "public") {
      resource.allowedUsers = [];
    }

    if (req.file) {
      resource.fileUrl = `/uploads/${req.file.filename}`;
      resource.fileName = req.file.originalname;
      resource.fileSize = req.file.size;
      resource.mimeType = req.file.mimetype;
      resource.resourceType = "file";
      resource.version += 1;
    }

    await resource.save();

    res.json({
      message: "Resource updated",
      data: await toPublicResource(resource, uid),
    });
  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (uid && resource.uploadedBy !== uid) {
      return res.status(403).json({ message: "Not allowed to delete this resource" });
    }

    await Resource.findByIdAndDelete(id);

    res.json({ message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!canAccessResource(resource, uid)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    const alreadyLiked = resource.likes.includes(uid);

    if (alreadyLiked) {
      resource.likes = resource.likes.filter((likeUid) => likeUid !== uid);
    } else {
      resource.likes.push(uid);
    }

    await resource.save();

    res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      data: await toPublicResource(resource, uid),
    });
  } catch (error) {
    res.status(500).json({
      message: "Like update failed",
      error: error.message,
    });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!canAccessResource(resource, uid)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    const alreadyBookmarked = resource.bookmarks.includes(uid);

    if (alreadyBookmarked) {
      resource.bookmarks = resource.bookmarks.filter((bookmarkUid) => bookmarkUid !== uid);
    } else {
      resource.bookmarks.push(uid);
    }

    await resource.save();

    res.json({
      message: alreadyBookmarked ? "Bookmark removed" : "Bookmarked",
      data: await toPublicResource(resource, uid),
    });
  } catch (error) {
    res.status(500).json({
      message: "Bookmark update failed",
      error: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, text } = req.body;

    if (!uid || !text) {
      return res.status(400).json({
        message: "uid and text are required",
      });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!canAccessResource(resource, uid)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    resource.comments.push({ uid, text });
    await resource.save();

    res.json({
      message: "Comment added",
      data: await toPublicResource(resource, uid),
    });
  } catch (error) {
    res.status(500).json({
      message: "Comment failed",
      error: error.message,
    });
  }
};

exports.reportResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, reason } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!canAccessResource(resource, uid)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    resource.reports.push({ uid, reason: reason || "" });
    await resource.save();

    res.json({ message: "Resource reported" });
  } catch (error) {
    res.status(500).json({
      message: "Report failed",
      error: error.message,
    });
  }
};

exports.incrementView = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body || {};

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!canAccessResource(resource, uid)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updatedResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "View counted" });
  } catch (error) {
    res.status(500).json({
      message: "View count failed",
      error: error.message,
    });
  }
};

exports.incrementDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body || {};

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!canAccessResource(resource, uid)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!updatedResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Download counted" });
  } catch (error) {
    res.status(500).json({
      message: "Download count failed",
      error: error.message,
    });
  }
};
