// Production-Ready Post Controller with Authorization & Validation
const Post = require("../models/Post");
const User = require("../models/User");
const { createAndEmitNotification } = require("./notification.controller");
const { sendSuccess, sendError, sendValidationError } = require("../utils/response");
const { sanitizeText, validateRequiredFields, validateStringLength } = require("../utils/validators");
const log = require("../utils/logger");
const { getStoredFileReference } = require("../utils/fileUpload");

/**
 * CREATE POST - With validation and error handling
 */
exports.createPost = async (req, res) => {
  try {
    const { uid, content } = req.body;
    const imageFiles = req.files || [];
    const trimmedContent = typeof content === "string" ? content.trim() : "";

    // Validation
    const errors = validateRequiredFields({ uid }, ["uid"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    if (!trimmedContent && imageFiles.length === 0) {
      return sendValidationError(
        res,
        "Post must contain text or at least one image"
      );
    }

    if (trimmedContent && !validateStringLength(trimmedContent, 1, 5000)) {
      return sendValidationError(res, "Post content must be between 1-5000 characters");
    }

    // Verify user exists
    const user = await User.findOne({ uid });
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Process images with individual error handling
    log.info("Processing images", { fileCount: imageFiles.length, uid });

    const images = await Promise.allSettled(
      imageFiles
        .slice(0, 5)
        .map((file) =>
          getStoredFileReference(file, "educonnect/posts", "image", {
            strict: true,
          })
            .catch(err => {
              log.error("Individual file upload failed", {
                filename: file.originalname,
                error: err.message
              });
              return null;
            })
        )
    );

    // Extract successful uploads, filter out failed ones
    const uploadedImages = images
      .filter(result => result.status === "fulfilled" && result.value)
      .map(result => result.value);

    if (imageFiles.length > 0 && uploadedImages.length === 0) {
      return sendError(
        res,
        "Image upload failed. Check Cloudinary configuration and credentials.",
        500
      );
    }

    log.info("Image upload complete", {
      requested: imageFiles.length,
      successful: uploadedImages.length,
      failed: imageFiles.length - uploadedImages.length
    });

    // Create post
    const newPost = await Post.create({
      uid,
      content: trimmedContent ? sanitizeText(trimmedContent) : "",
      images: uploadedImages,
      likes: [],
      comments: [],
    });

    // Send notifications (non-blocking)
    setImmediate(async () => {
      try {
        const io = req.app.get("io");
        if (!io) return;

        const otherUsers = await User.find({ uid: { $ne: uid } }).select("uid");

        await Promise.allSettled(
          otherUsers.map((user) =>
            createAndEmitNotification(io, {
              userId: user.uid,
              senderId: uid,
              type: "post",
              text: "A new post was published on EduConnect",
              link: "/posts",
            })
          )
        );
      } catch (notificationError) {
        log.warn("Post notification failed", notificationError.message);
      }
    });

    log.info("Post created", { postId: newPost._id, uid, imageCount: uploadedImages.length });
    return sendSuccess(res, newPost, "Post created successfully", 201);
  } catch (error) {
    log.error("Create post error", {
      message: error.message,
      stack: error.stack,
      uid: req.body?.uid
    });
    return sendError(res, "Failed to create post", 500);
  }
};

/**
 * GET ALL POSTS - With pagination
 */
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ deleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Attach user info
    const postsWithUser = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findOne({ uid: post.uid });
        return {
          ...post.toObject(),
          userName: user?.name || "Unknown User",
          userEmail: user?.email,
        };
      })
    );

    const total = await Post.countDocuments({ deleted: { $ne: true } });

    return sendSuccess(
      res,
      {
        posts: postsWithUser,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Posts retrieved successfully"
    );
  } catch (error) {
    log.error("Get posts error", error);
    return sendError(res, "Failed to retrieve posts", 500);
  }
};

/**
 * TOGGLE LIKE - Like/Unlike post
 */
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { uid } = req.body;

    // Validation
    if (!postId || !uid) {
      return sendValidationError(res, "Post ID and user ID required");
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post || post.deleted) {
      return sendError(res, "Post not found", 404);
    }

    // Check if already liked
    const alreadyLiked = post.likes.includes(uid);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id !== uid);
    } else {
      post.likes.push(uid);
    }

    await post.save();

    // Send notification only on new like
    if (!alreadyLiked) {
      setImmediate(async () => {
        try {
          const io = req.app.get("io");
          if (!io) return;

          const liker = await User.findOne({ uid });

          await createAndEmitNotification(io, {
            userId: post.uid,
            senderId: uid,
            type: "like",
            text: `${liker?.name || liker?.email || "Someone"} liked your post`,
            link: "/posts",
          });
        } catch (notificationError) {
          log.warn("Like notification failed", notificationError.message);
        }
      });
    }

    log.info("Post liked/unliked", { postId, uid });
    return sendSuccess(res, post, alreadyLiked ? "Post unliked" : "Post liked");
  } catch (error) {
    log.error("Toggle like error", error);
    return sendError(res, "Failed to toggle like", 500);
  }
};

/**
 * ADD COMMENT - With validation
 */
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { uid, text } = req.body;

    // Validation
    const errors = validateRequiredFields({ postId, uid, text }, ["postId", "uid", "text"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    if (!validateStringLength(text, 1, 500)) {
      return sendValidationError(res, "Comment must be between 1-500 characters");
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post || post.deleted) {
      return sendError(res, "Post not found", 404);
    }

    // Limit comments
    if (post.comments.length >= 500) {
      return sendError(res, "Post has reached maximum comments", 400);
    }

    // Add comment
    post.comments.push({
      uid,
      text: sanitizeText(text),
    });

    await post.save();

    // Send notification
    setImmediate(async () => {
      try {
        const io = req.app.get("io");
        if (!io) return;

        const commenter = await User.findOne({ uid });

        await createAndEmitNotification(io, {
          userId: post.uid,
          senderId: uid,
          type: "comment",
          text: `${commenter?.name || commenter?.email || "Someone"} commented on your post`,
          link: "/posts",
        });
      } catch (notificationError) {
        log.warn("Comment notification failed", notificationError.message);
      }
    });

    log.info("Comment added", { postId, uid });
    return sendSuccess(res, post, "Comment added successfully");
  } catch (error) {
    log.error("Add comment error", error);
    return sendError(res, "Failed to add comment", 500);
  }
};

/**
 * DELETE COMMENT - Only by commenter or post owner
 */
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { uid } = req.body;

    // Validation
    if (!postId || !commentId || !uid) {
      return sendValidationError(res, "Missing required parameters");
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post || post.deleted) {
      return sendError(res, "Post not found", 404);
    }

    // Find comment
    const commentIndex = post.comments.findIndex((c) => c._id.toString() === commentId);
    if (commentIndex === -1) {
      return sendError(res, "Comment not found", 404);
    }

    const comment = post.comments[commentIndex];

    // Authorization: Only commenter or post owner can delete
    if (comment.uid !== uid && post.uid !== uid) {
      return sendError(res, "Not authorized to delete this comment", 403);
    }

    // Delete comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    log.info("Comment deleted", { postId, commentId, uid });
    return sendSuccess(res, post, "Comment deleted successfully");
  } catch (error) {
    log.error("Delete comment error", error);
    return sendError(res, "Failed to delete comment", 500);
  }
};

/**
 * EDIT POST - Only by owner
 */
exports.editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, uid } = req.body;

    // Validation
    const errors = validateRequiredFields({ postId, content, uid }, ["postId", "content", "uid"]);
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    if (!validateStringLength(content, 1, 5000)) {
      return sendValidationError(res, "Post content must be between 1-5000 characters");
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post || post.deleted) {
      return sendError(res, "Post not found", 404);
    }

    // Authorization: Only owner can edit
    if (post.uid !== uid) {
      return sendError(res, "Not authorized to edit this post", 403);
    }

    // Update
    post.content = sanitizeText(content);
    await post.save();

    log.info("Post edited", { postId, uid });
    return sendSuccess(res, post, "Post updated successfully");
  } catch (error) {
    log.error("Edit post error", error);
    return sendError(res, "Failed to update post", 500);
  }
};

/**
 * DELETE POST - Only by owner or admin
 */
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { uid, isAdmin = false } = req.body;

    // Validation
    if (!postId || !uid) {
      return sendValidationError(res, "Post ID and user ID required");
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, "Post not found", 404);
    }

    // Authorization: Only owner or admin
    if (post.uid !== uid && !isAdmin) {
      return sendError(res, "Not authorized to delete this post", 403);
    }

    // Soft delete so the record remains in the database
    post.deleted = true;
    post.deletedAt = new Date();
    post.deletedBy = uid;
    await post.save();

    log.info("Post deleted", { postId, uid, isAdmin });
    return sendSuccess(res, { deletedPostId: postId }, "Post deleted successfully");
  } catch (error) {
    log.error("Delete post error", error);
    return sendError(res, "Failed to delete post", 500);
  }
};
