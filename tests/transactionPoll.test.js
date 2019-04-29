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
});
