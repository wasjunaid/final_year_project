const crypto = require("crypto");

function sha256Hex(inputUtf8) {
  return crypto.createHash("sha256").update(inputUtf8, "utf8").digest("hex");
}

module.exports = { sha256Hex };