const cryptoHash = require("./cryptoHash");
const { GENESIS_BLOCK_DATA } = require("../config/config");

// Basic Block Structure
class Block {
  constructor({ timestamp, lastHash, hash, data }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  // Static methods to create
  // instance of a class without using contructor
  static generateGenesis() {
    return new this(GENESIS_BLOCK_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    return new this({
      timestamp,
      lastHash,
      data,
      hash: cryptoHash(timestamp, lastHash, data)
    });
  }
}

module.exports = Block;
