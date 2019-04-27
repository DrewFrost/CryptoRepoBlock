const { GENESIS_DATA } = require("./config");

// Basic Block Structure
class Block {
  constructor({ timestamp, lastHash, hash, data }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  // Factory method to create
  // instance of a class without using contructor
  static genesis() {
    return new this(GENESIS_DATA);
  }
}

module.exports = Block;
