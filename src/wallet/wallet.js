const Transaction = require("./transaction");
const { STARTING_BALANCE } = require("../../config/config");
const cryptoHash = require("../../utils/cryptoHash");
const { ec } = require("../../utils/ec");

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
  createTransaction({ receiver, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }
    if (amount > this.balance) {
      throw new Error("Amount exceeds the balance of the wallet");
    }
    return new Transaction({ senderWallet: this, receiver, amount });
  }

  static calculateBalance({ chain, address }) {
    let hasTransmitedTransaction = false;
    let outputsTotal = 0;
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasTransmitedTransaction = true;
        }
        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal += addressOutput;
        }
      }
      if (hasTransmitedTransaction) {
        break;
      }
    }
    return hasTransmitedTransaction
      ? outputsTotal
      : STARTING_BALANCE + outputsTotal;
  }
}

module.exports = Wallet;
