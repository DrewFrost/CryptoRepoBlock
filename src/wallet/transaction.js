const uuid = require("uuid/v1");
const { verifySignature } = require("../../utils/ec");
const { REWARD_INPUT, MINING_REWARD } = require("../../config/config");

//Records of exchange of currency inside blockchain
class Transaction {
  constructor({ senderWallet, receiver, amount, outputMap, input }) {
    this.id = uuid();
    this.outputMap =
      outputMap || this.createOutputMap({ senderWallet, receiver, amount });
    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }
  //Output contains information that is used in transaction
  createOutputMap({ senderWallet, receiver, amount }) {
    const outputMap = {};

    outputMap[receiver] = amount;
    //records current balance of sender
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  //Input contains signature from sender
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

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD }
    });
  }
  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD }
    });
  }
  
  update({ senderWallet, receiver, amount }) {
    // checking for amount not to be greater than user have
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error("Amount exceeds the balance of the wallet");
    }
    //If receiver doesn't already exist in transaction
    if (!this.outputMap[receiver]) {
      //Assign amount to receiver
      this.outputMap[receiver] = amount;
    }
    //if receiver already exists in transaction
    else {
      this.outputMap[receiver] = this.outputMap[receiver] + amount;
    }

    // Take amount from sender wallet
    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    // New input for transaction
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }
}

module.exports = Transaction;
