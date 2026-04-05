const User = require("../models/User");

// CREATE USER PROFILE

exports.createUserProfile = async (req, res) => {
  try {
    const { uid, name, email, sapId, branch, year, role } = req.body;

    //  OPTIONAL: basic validation (non-breaking)
    if (!uid || !name || !email) {
      return res.status(400).json({
        message: "uid, name and email are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ uid });

    if (existingUser) {
      //  Fix bad names automatically
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

// GET USER BY UID

exports.getUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid }).select("-__v"); // ✅ small improvement

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

// GET ALL USERS

exports.getAllUsers = async (req, res) => {
  try {
    const { online } = req.query; //  NEW: filter support (non-breaking)

    let filter = {};

    //  OPTIONAL FILTER
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

// UPDATE ONLINE STATUS (OPTIONAL API)

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