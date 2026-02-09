const express = require("express");
const router = express.Router();

router.post("/create", (req, res) => {
  const { uid, email, role } = req.body;

  if (!uid || !email) {
    return res.status(400).json({
      message: "uid and email are required",
    });
  }

  // TEMP: just log (no DB yet)
  console.log("User received from frontend:");
  console.log({ uid, email, role });

  return res.status(201).json({
    message: "User creation API hit successfully",
    data: { uid, email, role },
  });
});

module.exports = router;
