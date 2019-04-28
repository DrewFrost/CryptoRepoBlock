const cryptoHash = require("./cryptoHash");
const { GENESIS_BLOCK_DATA, MINE_RATE } = require("../config/config");

// Basic Block Structure
class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  // Static methods to create
  // instance of a class without using contructor
  static generateGenesis() {
    return new this(GENESIS_BLOCK_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    let hash, timestamp;

    const lastHash = lastBlock.hash;
    const { difficulty } = lastBlock;
    let nonce = 0;
    //Checking if the difficulty of block is right
    do {
      nonce++;
      timestamp = Date.now();
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));
    return new this({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash
    });
  }

  // Regulating the difficulty by counting timestamp
  static regulateDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    const difference = timestamp - originalBlock.timestamp;
    if (difference > MINE_RATE) {
      return difficulty - 1;
    }
    return difficulty + 1;
  }
}

module.exports = Block;
