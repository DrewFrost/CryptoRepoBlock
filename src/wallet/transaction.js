const uuid = require("uuid/v1");

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
}

module.exports = Transaction;
