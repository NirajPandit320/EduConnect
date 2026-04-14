// Job Controller - Production Ready with Authorization
const Job = require("../models/Job");
const User = require("../models/User");
const { sendSuccess, sendError, sendValidationError } = require("../utils/response");
const { validateRequiredFields } = require("../utils/validators");
const log = require("../utils/logger");

const normalizeBranch = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const toNumberOrNull = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

/**
 * CREATE JOB - Admin only
 */
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      ctc,
      description,
      deadline,
      createdBy,
      isAdmin,
    } = req.body;

    // Validation
    const errors = validateRequiredFields(
      { title, company, deadline },
      ["title", "company", "deadline"]
    );
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    // Authorization - must be admin
    if (!isAdmin) {
      return sendError(res, "Only admins can create jobs", 403);
    }

    // Create job
    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      ctc: ctc ? Number(ctc) : null,
      description: description?.trim() || "",
      deadline: new Date(deadline),
      createdBy: createdBy || "admin",
      jobStatus: "active",
      applicationCount: 0,
    });

    log.info("Job created", { jobId: job._id, company });
    return sendSuccess(res, job, "Job created successfully", 201);
  } catch (error) {
    log.error("Create job error", error);
    return sendError(res, "Failed to create job", 500);
  }
};

/**
 * GET ALL JOBS - With pagination and filtering
 */
exports.getJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status
    if (status === "active") {
      query.deadline = { $gte: new Date() };
      query.jobStatus = "active";
    } else if (status === "expired") {
      query.deadline = { $lt: new Date() };
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    return sendSuccess(
      res,
      {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Jobs retrieved successfully"
    );
  } catch (error) {
    log.error("Get jobs error", error);
    return sendError(res, "Failed to retrieve jobs", 500);
  }
};

/**
 * GET SINGLE JOB BY ID
 */
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendValidationError(res, "Job ID required");
    }

    const job = await Job.findById(id);
    if (!job) {
      return sendError(res, "Job not found", 404);
    }

    return sendSuccess(res, job, "Job retrieved successfully");
  } catch (error) {
    log.error("Get job by ID error", error);
    return sendError(res, "Failed to retrieve job", 500);
  }
};

/**
 * CHECK ELIGIBILITY - User eligibility for jobs
 */
exports.checkEligibility = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return sendValidationError(res, "User ID required");
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const jobs = await Job.find({ jobStatus: "active", deadline: { $gte: new Date() } });

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

    log.info("Eligibility checked", { uid, eligibleCount: eligibleJobs.length });

    return sendSuccess(
      res,
      {
        eligibleJobs,
        notEligibleJobs,
      },
      "Eligibility check completed"
    );
  } catch (error) {
    log.error("Check eligibility error", error);
    return sendError(res, "Failed to check eligibility", 500);
  }
};

/**
 * DELETE JOB - Admin only
 */
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { isAdmin = false } = req.body;

    // Validation
    if (!jobId) {
      return sendValidationError(res, "Job ID required");
    }

    // Authorization
    if (!isAdmin) {
      return sendError(res, "Only admins can delete jobs", 403);
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, "Job not found", 404);
    }

    await Job.findByIdAndDelete(jobId);

    log.info("Job deleted", { jobId, company: job.company });
    return sendSuccess(res, { deletedJobId: jobId }, "Job deleted successfully");
  } catch (error) {
    log.error("Delete job error", error);
    return sendError(res, "Failed to delete job", 500);
  }
};