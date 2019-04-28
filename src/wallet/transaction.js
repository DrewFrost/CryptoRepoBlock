const uuid = require("uuid/v1");
const { verifySignature } = require("../../utils/ec");

class Transaction {
  constructor({ senderWallet, receiver, amount }) {
    this.id = uuid();
    this.outputMap = this.createOutputMap({ senderWallet, receiver, amount });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createOutputMap({ senderWallet, receiver, amount }) {
    const outputMap = {};

    outputMap[receiver] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }
  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }
  static validateTransaction(transaction) {
    const { input, outputMap } = transaction;
    const { address, amount, signature } = input;
    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmount) => {
        return total + outputAmount;
      }
    );
    if (amount !== outputTotal) {
      console.error(`Invalid transactiong from ${address}`);
      return false;
    }
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }
    return true;
  }
}

module.exports = Transaction;
