const Wallet = require("../src/wallet/wallet");
const Blockchain = require("../src/blockchain/blockchain");
const Transaction = require("../src/wallet/transaction");
const { STARTING_BALANCE } = require("../config/config");
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

    describe("When chain is passed", () => {
      it("should call Wallet.calculate()", () => {
        const calculateBalanceTest = jest.fn();

        const originalCalculateBalance = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceTest;

        wallet.createTransaction({
          receiver: "tester",
          amount: 15,
          chain: new Blockchain().chain
        });

        expect(calculateBalanceTest).toHaveBeenCalled();

        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe("calculateBalance", () => {
    let blockchain;
    beforeEach(() => {
      blockchain = new Blockchain();
    });
    describe("No outputs for wallet ", () => {
      it("should return starting balance", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(STARTING_BALANCE);
      });
    });
    describe("Wallet has outputs", () => {
      let firstTransaction, secondTransaction;
      beforeEach(() => {
        firstTransaction = new Wallet().createTransaction({
          receiver: wallet.publicKey,
          amount: 30
        });
        secondTransaction = new Wallet().createTransaction({
          receiver: wallet.publicKey,
          amount: 60
        });

        blockchain.addBlock({ data: [firstTransaction, secondTransaction] });
      });

      it("should add sum of all outputs", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey
          })
        ).toEqual(
          STARTING_BALANCE +
            firstTransaction.outputMap[wallet.publicKey] +
            secondTransaction.outputMap[wallet.publicKey]
        );
      });
      describe("When wallet made a recent transaction", () => {
        let recentTransaction;

        beforeEach(() => {
          recentTransaction = wallet.createTransaction({
            receiver: "moneymaker",
            amount: 57
          });

          blockchain.addBlock({ data: [recentTransaction] });
        });
        it("should return output amount of recent transaction", () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            })
          ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
        });
        describe("When there are outputs next to recent transaction", () => {
          let commonBlockTransaction, nextBlockTransaction;

          beforeEach(() => {
            recentTransaction = wallet.createTransaction({
              receiver: "newmoneymaker",
              amount: 63
            });

            commonBlockTransaction = Transaction.rewardTransaction({
              minerWallet: wallet
            });
            blockchain.addBlock({
              data: [recentTransaction, commonBlockTransaction]
            });
            nextBlockTransaction = new Wallet().createTransaction({
              receiver: wallet.publicKey,
              amount: 35
            });

            blockchain.addBlock({ data: [nextBlockTransaction] });
          });

          it("should include the output amounts in the returned balance", () => {
            expect(
              Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey
              })
            ).toEqual(
              recentTransaction.outputMap[wallet.publicKey] +
                commonBlockTransaction.outputMap[wallet.publicKey] +
                nextBlockTransaction.outputMap[wallet.publicKey]
            );
          });
        });
      });
    });
  });
});
