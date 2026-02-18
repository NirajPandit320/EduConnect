const User = require("../models/User");

// CREATE USER PROFILE
exports.createUserProfile = async (req, res) => {
  try {
    const { name, email, sapId, branch, year } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      sapId,
      branch,
      year,
    });

    res.status(201).json({
      message: "User profile created successfully",
      user: newUser,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
