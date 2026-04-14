const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

const APPLICATION_REWARD_POINTS = 5;

// APPLY JOB
exports.applyJob = async (req, res) => {
  try {
    const { jobId, userUid } = req.body || {};

    if (!jobId || !userUid) {
      return res.status(400).json({
        success: false,
        message: "jobId and userUid are required",
        data: null,
      });
    }

    const [job, user] = await Promise.all([
      Job.findById(jobId),
      User.findOne({ uid: userUid }),
    ]);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        data: null,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const existing = await Application.findOne({ jobId, userUid });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Already applied",
        data: existing,
        application: existing,
      });
    }

    const app = await Application.create({ jobId, userUid });

    await User.updateOne({ uid: userUid }, { $inc: { points: APPLICATION_REWARD_POINTS } });

    res.status(201).json({
      success: true,
      message: "Applied successfully",
      data: app,
      application: app,
      rewardPoints: APPLICATION_REWARD_POINTS,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Already applied",
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: "Application failed",
      data: null,
      error: err.message,
    });
  }
};

// GET USER APPLICATIONS
exports.getMyApplications = async (req, res) => {
  try {
    const { uid } = req.params;

    const apps = await Application.find({ userUid: uid })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      data: null,
      error: err.message,
    });
  }
};

exports.getApplicationForJob = async (req, res) => {
  try {
    const { jobId, uid } = req.params;
    const application = await Application.findOne({ jobId, userUid: uid });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
        data: null,
      });
    }

    return res.status(200).json(application);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
      data: null,
      error: err.message,
    });
  }
};