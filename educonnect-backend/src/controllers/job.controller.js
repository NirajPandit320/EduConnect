const Job = require("../models/Job");
const User = require("../models/User");

const normalizeBranch = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const toNumberOrNull = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

// CREATE JOB (ADMIN)
exports.createJob = async (req, res) => {
  try {
    const { title, company, deadline } = req.body || {};

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "title and company are required",
        data: null,
      });
    }

    if (deadline && Number.isNaN(new Date(deadline).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid deadline",
        data: null,
      });
    }

    const job = await Job.create(req.body || {});

    res.status(201).json({
      success: true,
      message: "Job created",
      data: job,
      job,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Job creation failed",
      data: null,
      error: err.message,
    });
  }
};

// GET ALL JOBS
exports.getJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status === "active") {
      query.deadline = { $gte: new Date() };
    }

    if (status === "expired") {
      query.deadline = { $lt: new Date() };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      data: null,
      error: err.message,
    });
  }
};

// GET SINGLE JOB
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        data: null,
      });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      data: null,
      error: err.message,
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted",
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Job deletion failed",
      data: null,
      error: error.message,
    });
  }
};

//Checking eligibility of user for jobs

exports.checkEligibility = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const jobs = await Job.find();

    const eligibleJobs = [];
    const notEligibleJobs = [];

    jobs.forEach((job) => {
      const reasons = [];
      const eligibleBranchList = Array.isArray(job.eligibility?.branch)
        ? job.eligibility.branch.map(normalizeBranch)
        : [];
      const userBranch = normalizeBranch(user.branch);
      const userCgpa = toNumberOrNull(user.cgpa);
      const userYear = toNumberOrNull(user.year);
      const minCgpa = toNumberOrNull(job.eligibility?.minCGPA);
      const jobYear = toNumberOrNull(job.eligibility?.year);

      // Branch check
      if (eligibleBranchList.length && !eligibleBranchList.includes(userBranch)) {
        reasons.push("Branch not eligible");
      }

      // CGPA check
      if (minCgpa !== null) {
        if (userCgpa === null) {
          reasons.push("CGPA not available");
        } else if (userCgpa < minCgpa) {
          reasons.push("CGPA too low");
        }
      }

      // Year check
      if (jobYear !== null) {
        if (userYear === null) {
          reasons.push("Year not available");
        } else if (userYear !== jobYear) {
          reasons.push("Year not eligible");
        }
      }

      if (reasons.length === 0) {
        eligibleJobs.push(job);
      } else {
        notEligibleJobs.push({
          job,
          reasons,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Eligibility checked",
      data: {
        eligibleJobs,
        notEligibleJobs,
      },
      eligibleJobs,
      notEligibleJobs,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Eligibility check failed",
      data: null,
      error: error.message,
    });
  }
};