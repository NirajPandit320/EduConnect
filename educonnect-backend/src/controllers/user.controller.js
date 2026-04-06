const User = require("../models/User");
const Post = require("../models/Post");
const Event = require("../models/Event");
const Resource = require("../models/Resource");

// CREATE USER PROFILE (UNCHANGED)

exports.createUserProfile = async (req, res) => {
  try {
    const { uid, name, email, sapId, branch, year, role } = req.body;

    if (!uid || !name || !email) {
      return res.status(400).json({
        message: "uid, name and email are required",
      });
    }

    const existingUser = await User.findOne({ uid });

    if (existingUser) {
      if (
        existingUser.name === "No Name" ||
        existingUser.name === "Temporary Name"
      ) {
        existingUser.name =
          existingUser.email?.split("@")[0] || "User";

        await existingUser.save();
      }

      return res.status(200).json({
        message: "User already exists",
        user: existingUser,
      });
    }

    const newUser = await User.create({
      uid,
      name,
      email,
      sapId,
      branch,
      year,
      role,
    });

    res.status(201).json({
      message: "User profile created successfully",
      user: newUser,
    });

  } catch (error) {
    console.log("Create user error:", error.message);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// GET USER BY UID (UNCHANGED)

exports.getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid }).select("-__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Fetching failed",
      error: error.message,
    });
  }
};

// GET ALL USERS (UNCHANGED)

exports.getAllUsers = async (req, res) => {
  try {
    const { online } = req.query;

    let filter = {};

    if (online === "true") {
      filter.isOnline = true;
    }

    const users = await User.find(filter).select("-__v");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// UPDATE ONLINE STATUS (UNCHANGED)

exports.updateOnlineStatus = async (req, res) => {
  try {
    const { uid, isOnline } = req.body;

    const user = await User.findOneAndUpdate(
      { uid },
      { isOnline },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Status updated",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Status update failed",
      error: error.message,
    });
  }
};

// NEW: GET PROFILE (FOR PROFILE PAGE)  \SAFE ADDITION

exports.getProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid }).select("-__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Profile fetch failed",
      error: error.message,
    });
  }
};


// UPDATE PROFILE SETTINGS SAFE ADDITION

exports.updateProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    // Only allow safe fields (prevents breaking logic)
    const allowedUpdates = [
      "name",
      "bio",
      "avatar",
      "branch",
      "year",
      "sapId",
      "skills",
      "interests",
      "githubUrl",
      "linkedinUrl",
      "resumeUrl",
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findOneAndUpdate(
      { uid },
      updates,
      { new: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

exports.getProfileStats = async (req, res) => {
  try {
    const { uid } = req.params;

    const [postsCreated, resourcesUploaded, eventsJoined] = await Promise.all([
      Post.countDocuments({ uid }),
      Resource.countDocuments({ uploadedBy: uid }),
      Event.countDocuments({ participants: uid }),
    ]);

    const user = await User.findOne({ uid }).select("points");

    res.status(200).json({
      message: "Stats fetched",
      stats: {
        postsCreated,
        resourcesUploaded,
        eventsJoined,
        leaderboardPoints: user?.points || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Stats fetch failed",
      error: error.message,
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { uid } = req.params;
    const settingsPayload = req.body.settings || req.body;

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.settings = {
      ...user.settings,
      ...settingsPayload,
      appearance: {
        ...user.settings?.appearance,
        ...settingsPayload.appearance,
      },
      notifications: {
        ...user.settings?.notifications,
        ...settingsPayload.notifications,
      },
      privacy: {
        ...user.settings?.privacy,
        ...settingsPayload.privacy,
      },
      preferences: {
        ...user.settings?.preferences,
        ...settingsPayload.preferences,
      },
    };

    await user.save();

    res.status(200).json({
      message: "Settings updated",
      settings: user.settings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Settings update failed",
      error: error.message,
    });
  }
};