const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

const APPLICATION_REWARD_POINTS = 5;

// APPLY JOB
exports.applyJob = async (req, res) => {
  try {
    const { jobId, userUid } = req.body;

    if (!jobId || !userUid) {
      return res.status(400).json({ message: "jobId and userUid are required" });
    }

    const [job, user] = await Promise.all([
      Job.findById(jobId),
      User.findOne({ uid: userUid }),
    ]);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await Application.findOne({ jobId, userUid });

    if (existing) {
      return res.status(409).json({
        message: "Already applied",
        application: existing,
      });
    }

    const app = await Application.create({ jobId, userUid });

    await User.updateOne({ uid: userUid }, { $inc: { points: APPLICATION_REWARD_POINTS } });

    res.status(201).json({
      message: "Applied successfully",
      application: app,
      rewardPoints: APPLICATION_REWARD_POINTS,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Already applied" });
    }

    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

exports.getApplicationForJob = async (req, res) => {
  try {
    const { jobId, uid } = req.params;
    const application = await Application.findOne({ jobId, userUid: uid });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json(application);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};