const { ADMIN_EMAIL } = require("../config/admin");

const isAdmin = (req, res, next) => {
  const email = req.headers.email || req.body.email;

  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({
      message: "Admin access only",
    });
  }

  next();
};

module.exports = isAdmin;