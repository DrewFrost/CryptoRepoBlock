const Block = require("./block.js");
const cryptoHash = require("./cryptoHash");

class Blockchain {
  // Initializing the chain with genesis block alread in chain
  constructor() {
    this.chain = [Block.generateGenesis()];
  }

  //Adding block to existing chain with mineBlock()
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data
    });

    this.chain.push(newBlock);
  }

  static isChainValid(chain) {
    //Validate genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.generateGenesis())) {
      return false;
    }
    //Validate all other blocks of chain
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];

      const previousBlockHash = chain[i - 1].hash;

      if (lastHash !== previousBlockHash) {
        return false;
      }
      const validHash = cryptoHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty
      );

      if (hash !== validHash) {
        return false;
      }
    }
    return true;
  }

  alterChain(chain) {
    if (chain.length <= this.chain.length) {
      console.error("New chain must be longer");
      return;
    }

    if (!Blockchain.isChainValid(chain)) {
      console.error("New chain must be valid");
      return;
    }

    this.chain = chain;
    console.log("Chain was altered");
  }
}

module.exports = Blockchain;
