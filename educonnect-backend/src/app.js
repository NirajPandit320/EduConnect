require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const log = require("./utils/logger");

// Route imports
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const eventRoutes = require("./routes/event.routes");
const messageRoutes = require("./routes/message.routes");
const notificationRoutes = require("./routes/notification.routes");
const adminRoutes = require("./routes/admin.routes");
const resourceRoutes = require("./routes/resource.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");

// ============================================
// CORS Configuration (FIXED - with proper config)
// ============================================
const corsOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "https://edu-connector.netlify.app",
];

// Add Netlify production URLs if configured
if (process.env.NETLIFY_URL) {
  corsOrigins.push(process.env.NETLIFY_URL);
}

// Add any additional CORS origins from env
if (process.env.CORS_ORIGINS) {
  const additionalOrigins = process.env.CORS_ORIGINS.split(",").map((origin) =>
    origin.trim()
  );
  corsOrigins.push(...additionalOrigins);
}

console.log("✅ CORS Allowed Origins:", corsOrigins);

// CORS Options - FIXED with proper headers
const corsOptions = {
  origin: (origin, callback) => {
    // Log incoming request origin
    console.log(`📍 Incoming request origin: ${origin || "NO_ORIGIN"}`);

    // Allow requests with no origin (mobile apps, curl, postman, same-origin)
    if (!origin) {
      console.log("✓ Allowed: No origin (same-origin, mobile app, curl, etc.)");
      return callback(null, true);
    }

    // Check if origin is in whitelist
    if (corsOrigins.includes(origin)) {
      console.log(`✓ Allowed: ${origin}`);
      return callback(null, true);
    }

    // Blocked
    console.log(`✗ BLOCKED: ${origin} not in whitelist`);
    return callback(new Error(`CORS Error: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Admin-Session",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};

// ============================================
// Middleware (in correct order)
// ============================================
// 1. CORS FIRST (MOST IMPORTANT)
app.use(cors(corsOptions));

// 2. Body parsers
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// 3. Static file serving
app.use("/uploads", express.static("uploads"));

// ============================================
// Routes
// ============================================
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// ============================================
// Health check endpoint
// ============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EduConnect Server is running",
    timestamp: new Date().toISOString(),
    origin: req.get("origin"),
  });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ============================================
// Global Error Handling Middleware (MUST be last)
// ============================================
app.use(errorHandler);

module.exports = app;