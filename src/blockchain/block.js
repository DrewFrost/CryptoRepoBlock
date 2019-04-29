const hexToBinary = require("hex-to-binary");
const cryptoHash = require("../../utils/cryptoHash");
const { GENESIS_BLOCK_DATA, MINE_RATE } = require("../../config/config");

// Basic Block Structure
class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    //For proof of work
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  // Static methods to create
  // instance of a class without using contructor
  //Creating genesis block of blockchain
  static generateGenesis() {
    return new this(GENESIS_BLOCK_DATA);
  }
  //Mining out block using Proof of work consensus
  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash;

    let hash, timestamp;
    let { difficulty } = lastBlock;
    let nonce = 0;
    //Checking if the difficulty of block is right and using binary hashes
    // to upgrade difficulty of Proof Of Work
    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.regulateDifficulty({
        originalBlock: lastBlock,
        timestamp
      });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );
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
  // to secure system from 51% attacks
  static regulateDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    const difference = timestamp - originalBlock.timestamp;

    if (difficulty < 1) {
      return 1;
    }
    if (difference > MINE_RATE) {
      return difficulty - 1;
    }
    return difficulty + 1;
  }
}

module.exports = Block;
