const { ADMIN_EMAIL } = require("../config/admin");

const isAdmin = (req, res, next) => {
  const emailFromHeader = req.headers?.email || req.headers?.["x-admin-email"];
  const emailFromBody = req.body && typeof req.body === "object" ? req.body.email : undefined;
  const email = emailFromHeader || emailFromBody;

  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
      data: null,
    });
  }

  next();
};

module.exports = isAdmin;