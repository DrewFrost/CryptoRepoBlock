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

  isChainValid(chain) {
    //Validate genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.generateGenesis())) {
      return false;
    }
    //Validate all other blocks of chain
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      const previousBlockHash = chain[i - 1].hash;

      const { timestamp, lastHash, hash, data } = block;

      if (lastHash !== previousBlockHash) {
        return false;
      }
      const validHash = cryptoHash(timestamp, lastHash, data);

      if (hash !== validHash) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Blockchain;
