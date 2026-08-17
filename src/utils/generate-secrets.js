const crypto = require("crypto");

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

console.log("JWT_SECRET=");
console.log(generateSecret(64));

console.log("\nJWT_REFRESH_SECRET=");
console.log(generateSecret(64));

console.log("\nSESSION_SECRET=");
console.log(generateSecret(64));