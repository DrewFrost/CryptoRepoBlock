const Transaction = require("./wallet/transaction");

//Gets valid transactions from pool and sends rewards to miners
class Miner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransactions() {
    //Must get transaction pool valid transactions
    const validTransactions = this.transactionPool.validTransactions();

    //Miners reward
    validTransactions.push(
      Transaction.rewardTransaction({ minerWallet: this.mineTransactions })
    );

    //Add block with mined transactions to blockchain

    this.blockchain.addBlock({ data: validTransactions });
    //Transmit updated blockchain

    this.pubsub.transmitChain();

    //Clear transactions pool
    this.transactionPool.clear();
  }
}

module.exports = Miner;
