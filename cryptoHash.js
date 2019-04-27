const crypto = require("crypto");

// Cryptographic hash function for inputs
const cryptoHash = (...inputs) => {
  const hash = crypto.createHash("sha256");

  hash.update(inputs.sort().join(" "));
  // Return digest of hash function in chosen encoding
  return hash.digest("hex");
};

module.exports = cryptoHash;
