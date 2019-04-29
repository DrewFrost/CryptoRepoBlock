const Transaction = require("../src/wallet/transaction");
const Wallet = require("../src/wallet/wallet");
const { verifySignature } = require("../utils/ec");
describe("Transaction", () => {
  let transaction, senderWallet, receiver, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    receiver = "publicKeyreceiver";
    amount = 50;
    transaction = new Transaction({
      senderWallet,
      receiver,
      amount
    });
  });

  it("should have an id", () => {
    expect(transaction).toHaveProperty("id");
  });

  describe("outputMap", () => {
    it("should have an outpoutMap", () => {
      expect(transaction).toHaveProperty("outputMap");
    });

    it("should output amount to receiver", () => {
      expect(transaction.outputMap[receiver]).toEqual(amount);
    });

    it("should output remaining balance for sender wallet", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe("input", () => {
    it("should have input", () => {
      expect(transaction).toHaveProperty("input");
    });
    it("should have timestamp", () => {
      expect(transaction.input).toHaveProperty("timestamp");
    });

    it("should set amount in sender wallet balance", () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it("should set the address to the sender wallet public key", () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it("should sign the input", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature
        })
      ).toBe(true);
    });
  });

  describe("validateTransaction()", () => {
    let errorMsg;
    beforeEach(() => {
      errorMsg = jest.fn();

      global.console.error = errorMsg;
    });
    describe("transaction is valid", () => {
      it("should return true", () => {
        expect(Transaction.validateTransaction(transaction)).toBe(true);
      });
    });
    describe("transaction is invalid", () => {
      describe("transaction outputMap is invalid", () => {
        it("should return false", () => {
          transaction.outputMap[senderWallet.publicKey] = 10000000000;
          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMsg).toHaveBeenCalled();
        });
      });
      describe("transaction signature is fake", () => {
        it("should return false", () => {
          transaction.input.signature = new Wallet().sign("fakesignature");
          expect(Transaction.validateTransaction(transaction)).toBe(false);
          expect(errorMsg).toHaveBeenCalled();
        });
      });
    });
  });
  describe("update()", () => {
    let originalSignature, originalOuput, nextReceiver, nextAmount;
    beforeEach(() => {
      originalSignature = transaction.input.signature;
      originalOuput = transaction.outputMap[senderWallet.publicKey];
      nextReceiver = "nextvalidreceiver";
      nextAmount = 45;

      transaction.update({
        senderWallet,
        receiver: nextReceiver,
        amount: nextAmount
      });
    });
    it("should output the amount to next receiver", () => {
      expect(transaction.outputMap[nextReceiver]).toEqual(nextAmount);
    });
    it("should substract the amount from sender output amount", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        originalOuput - nextAmount
      );
    });
    it("should maintain total ouput that matches the input amount", () => {
      expect(
        Object.values(transaction.outputMap).reduce(
          (total, outputAmount) => total + outputAmount
        )
      ).toEqual(transaction.input.amount);
    });
    it("should resign transaction", () => {
      expect(transaction.input.signature).not.toEqual(originalSignature);
    });
  });
});
