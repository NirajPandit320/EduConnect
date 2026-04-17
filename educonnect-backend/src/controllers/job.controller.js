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

const toCtcNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalized = String(value).replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
};

const parseDeadline = (value) => {
  if (!value) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const raw = String(value).trim();
  const dateOnlyMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  return parsed;
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
      salary,
      description,
      deadline,
      location,
      createdBy,
    } = req.body;

    // Validation - only title and company required (deadline optional with default)
    const errors = validateRequiredFields(
      { title, company },
      ["title", "company"]
    );
    if (errors.length) {
      return sendValidationError(res, "Validation failed", errors);
    }

    // Map salary to ctc if provided, otherwise use ctc directly
    const jobCtc = toCtcNumberOrNull(ctc ?? salary);

    // Use provided deadline or default to 30 days from now
    const jobDeadline = parseDeadline(deadline);

    // Create job
    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || "",
      ctc: jobCtc,
      description: description?.trim() || "",
      deadline: jobDeadline,
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
    const { status = "active", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // Admin can view all jobs if status=all is requested
    if (status === "all") {
      // No filters - return all jobs
    } else if (status === "active") {
      query.$or = [
        { deadline: { $exists: false } },
        { deadline: null },
        { deadline: { $gte: new Date() } },
      ];
      query.jobStatus = "active";
    } else if (status === "expired") {
      query.deadline = { $lt: new Date() };
    } else if (status === "closed" || status === "archived") {
      query.jobStatus = status;
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

    const jobs = await Job.find({
      jobStatus: "active",
      $or: [
        { deadline: { $exists: false } },
        { deadline: null },
        { deadline: { $gte: new Date() } },
      ],
    });

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
 * UPDATE JOB STATUS - Admin only
 */
exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!id) {
      return sendValidationError(res, "Job ID required");
    }

    if (!status || !["active", "closed", "archived"].includes(status)) {
      return sendValidationError(res, "Valid status required (active, closed, archived)");
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { jobStatus: status },
      { new: true }
    );

    if (!job) {
      return sendError(res, "Job not found", 404);
    }

    log.info("Job status updated", { jobId: id, status });
    return sendSuccess(res, { job }, "Job status updated successfully");
  } catch (error) {
    log.error("Update job status error", error);
    return sendError(res, "Failed to update job status", 500);
  }
};

/**
 * DELETE JOB - Admin only
 */
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validation
    if (!jobId) {
      return sendValidationError(res, "Job ID required");
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