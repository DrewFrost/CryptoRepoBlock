const Blockchain = require("../src/blockchain/blockchain");
const TransactionPool = require("../src/wallet/transactionPool");
const Transaction = require("../src/wallet/transaction");
const Wallet = require("../src/wallet/wallet");

describe("TransactionPool", () => {
  let transactionPool, senderWallet, transaction;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      receiver: "poolreceiver",
      amount: 35
    });
  });

  describe("setTransaction()", () => {
    it("should add a transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });
  describe("existingTransaction()", () => {
    it("should return existing transaction with existing input address ", () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey
        })
      ).toBe(transaction);
    });
  });
  describe("validTransactions()", () => {
    let validTransactions, errorMsg;
    beforeEach(() => {
      validTransactions = [];
      errorMsg = jest.fn();
      global.console.error = errorMsg;
      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          senderWallet,
          receiver: "validareceiver",
          amount: 30
        });

        if (i % 3 === 0) {
          transaction.input.amount = 66666666;
        } else if (i % 3 === 1) {
          transaction.input.signature = new Wallet().sign("fakesignature");
        } else {
          validTransactions.push(transaction);
        }
        transactionPool.setTransaction(transaction);
      }
    });
    it("should return valid transactions", () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });
    it("should log error", () => {
      transactionPool.validTransactions();
      expect(errorMsg).toHaveBeenCalled();
    });
  });

  describe("clear()", () => {
    it("should clear the transaction", () => {
      transactionPool.clear();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });
  describe("clearBlockchainTransactions()", () => {
    it("should clear pool of already existing transactions in blockchain", () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};
      for (let i = 0; i < 7; i++) {
        const transaction = new Wallet().createTransaction({
          receiver: "testingreceiver",
          amount: 25
        });

        transactionPool.setTransaction(transaction);

        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
      }

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
