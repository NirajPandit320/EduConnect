const express = require("express");
const router = express.Router();
const User = require("../models/User");
const isAdmin = require("../middleware/admin.middleware");

const {
  createUserProfile,
  getUserByUid,
  getProfile,        //  NEW
  updateProfile,     //  NEW
  getProfileStats,
  updateSettings,
} = require("../controllers/user.controller");


// ===============================
// CREATE USER PROFILE
// POST /api/users
// ===============================
router.post("/", createUserProfile);


// ===============================
// GET ALL USERS
// GET /api/users
// ===============================
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


// ===============================
// GET USER BY FIREBASE UID
// GET /api/users/uid/:uid
// ===============================
router.get("/uid/:uid", getUserByUid);


// =====================================================
// PROFILE ROUTES (SAFE - NO CONFLICT)
// =====================================================

// GET PROFILE BY UID
// GET /api/users/profile/:uid
router.get("/profile/:uid", getProfile);
router.get("/profile/:uid/stats", getProfileStats);

// UPDATE PROFILE / SETTINGS
// PUT /api/users/profile/:uid
router.put("/profile/:uid", updateProfile);
router.put("/settings/:uid", updateSettings);


// ===============================
// GET USER BY MONGODB ID
// GET /api/users/:id
// ===============================
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


// ===============================
// UPDATE USER (BY MONGODB ID)
// PUT /api/users/:id
// ===============================
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


// ===============================
// DELETE USER
// DELETE /api/users/:id
// ===============================
router.patch("/:id/block", isAdmin, async (req, res) => {
  try {
    const shouldBlock = Boolean(req.body?.blocked);
    const status = shouldBlock ? "blocked" : "active";

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: shouldBlock ? "User blocked successfully" : "User unblocked successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update user status",
      error: error.message,
    });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: "blocked" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User blocked successfully",
      user: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Block failed",
      error: error.message,
    });
  }
});


module.exports = router;