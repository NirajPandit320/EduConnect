
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

const readRawEnvValue = (key) => {
  try {
    const envFile = fs.readFileSync(envPath, "utf8");
    const line = envFile
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith(`${key}=`));

    if (!line) {
      return undefined;
    }

    return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    return undefined;
  }
};

const ADMIN_EMAIL = String(
  readRawEnvValue("ADMIN_EMAIL") || process.env.ADMIN_EMAIL || "admin@educonnect.com"
).trim();

const ADMIN_PASSWORD = String(
  readRawEnvValue("ADMIN_PASSWORD") || process.env.ADMIN_PASSWORD || "Gayatri@#$123321"
).trim(); // Should be hashed in production

module.exports = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
};
