const Block = require("./block.js");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet/wallet");
const cryptoHash = require("../../utils/cryptoHash");
const { REWARD_INPUT, MINING_REWARD } = require("../../config/config");

//Collects out blocks in chain
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
  //Checks if new chain is longer and valid and alters chain in blockchain
  alterChain(chain, validateTransactions, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error("New chain must be longer");
      return;
    }

    if (!Blockchain.isChainValid(chain)) {
      console.error("New chain must be valid");
      return;
    }
    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error("New chain has invalid data");
      return;
    }
    if (onSuccess) onSuccess();
    this.chain = chain;
    console.log("Chain was replaced");
  }
  //Forms rules of cryptocurrency
  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();

      let rewardTransactionCount = 0;
      for (let transaction of block.data) {
        //Check for miner to have only one reward
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;
          if (rewardTransactionCount > 1) {
            console.error("You can't get more than one reward");
            return false;
          }
          //Check if miner receives right, hardcoded amount
          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("Miner reward amount is invalid");
            return false;
          }
        } else {
          if (!Transaction.validateTransaction(transaction)) {
            console.error("Transaction is invalid");
            return false;
          }
          const realBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          });
          //Check of someone tries to fake their wallet balance on transaction
          if (transaction.input.amount !== realBalance) {
            console.error("Invalid amount");
            return false;
          }
          //Checks for duplicating transactions in the block
          if (transactionSet.has(transaction)) {
            console.error("There are identical transactions in block");
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }
    return true;
  }

  static isChainValid(chain) {
    //Validate genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.generateGenesis())) {
      return false;
    }
    //Validate all other blocks of chain
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
      const lastBlockDifficulty = chain[i - 1].difficulty;
      const previousBlockHash = chain[i - 1].hash;
      // Check if previous block hash equals to current block last hash
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
      // Check if current block hash is valid
      if (hash !== validHash) {
        return false;
      }
      // Check for difficulty not to jump more than 1
      if (Math.abs(lastBlockDifficulty - difficulty > 1)) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Blockchain;
