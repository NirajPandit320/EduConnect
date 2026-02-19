const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  createUserProfile,
  getUserByUid
} = require("../controllers/user.controller");



// CREATE USER PROFILE
// POST /api/users

router.post("/", createUserProfile);


// GET ALL USERS
// GET /api/users

router.get("/", async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({
      message: "Fetching failed",
      error: error.message,
    });
  }
});


// GET USER BY FIREBASE UID
// GET /api/users/uid/:uid

router.get("/uid/:uid", getUserByUid);


// GET USER BY MONGODB ID
// GET /api/users/:id

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

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
});


// UPDATE USER
// PUT /api/users/:id

router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message,
    });
  }
});

// DELETE USER
// DELETE /api/users/:id

router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Deletion failed",
      error: error.message,
    });
  }
});

module.exports = router;
