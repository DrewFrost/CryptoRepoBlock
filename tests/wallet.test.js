const Wallet = require("../src/wallet/wallet");
const Transaction = require("../src/wallet/transaction");
const { verifySignature } = require("../utils/ec");

describe("Wallet", () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it("Should have a balance", () => {
    expect(wallet).toHaveProperty("balance");
  });
  it("should have a public key", () => {
    expect(wallet).toHaveProperty("publicKey");
  });

  describe("Has to sign data", () => {
    const data = "test data";

    it("should verify digital signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });

    it("should not verify invalid digital signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)
        })
      ).toBe(false);
    });
  });
  describe("createTransaction()", () => {
    describe("When amount is bigger than balance on wallet", () => {
      it("should throw an error", () => {
        expect(() =>
          wallet.createTransaction({
            amount: 10000000000000,
            receiver: "testreceiver"
          })
        ).toThrow("Amount exceeds the balance of the wallet");
      });
    });

    describe("When amount is valid", () => {
      let transaction, amount, receiver;
      beforeEach(() => {
        amount = 30;
        receiver = "legitreceiver";
        transaction = wallet.createTransaction({ amount, receiver });
      });
      it("should create a transaction", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });
      it("should match the input with the wallet", () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });
      it("should output the amount to receiver", () => {
        expect(transaction.outputMap[receiver]).toEqual(amount);
      });
    });
  });
});
