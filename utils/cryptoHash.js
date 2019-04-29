const crypto = require("crypto");

// Cryptographic hash function for any number inputs
// sort them stringify inputs and and creates unique hash
const cryptoHash = (...inputs) => {
  const hash = crypto.createHash("sha256");
  //Mapping through input and strigify all of items inside
  hash.update(
    inputs
      .map(input => JSON.stringify(input))
      .sort()
      .join(" ")
  );
  // Return digest of hash function in chosen encoding

  return hash.digest("hex");
};

module.exports = cryptoHash;
