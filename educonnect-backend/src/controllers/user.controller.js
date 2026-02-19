const User = require("../models/User");

// CREATE USER PROFILE
exports.createUserProfile = async (req, res) => {
  try {
    const { uid, name, email, sapId, branch, year, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ uid });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
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

    const user = await User.findOne({ uid });

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