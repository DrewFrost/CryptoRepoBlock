const Blockchain = require("../src/blockchain/blockchain");
const Block = require("../src/blockchain/block");
const Wallet = require("../src/wallet/wallet");
const Transaction = require("../src/wallet/transaction");
const cryptoHash = require("../utils/cryptoHash");

describe("Blockchain", () => {
  let blockchain, newChain, originalChain, errorMsg;
  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
    errorMsg = jest.fn();
    global.console.error = errorMsg;
  });

  it("Has to contain chain array", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it("Has to start with genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.generateGenesis());
  });
  it("Has to add new block to the chain", () => {
    const newData = "test data";
    blockchain.addBlock({ data: newData });

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });
  describe("isChainValid()", () => {
    describe("Instance when chain doesn't start with genesis block", () => {
      it("Has to return false", () => {
        blockchain.chain[0] = { data: "not our genesis block" };
        expect(Blockchain.isChainValid(blockchain.chain)).toBe(false);
      });
    });
    describe("When chain starts with genesis block and has blocks", () => {
      describe("When lasthash link has changed", () => {
        it("Has to return false", () => {
          blockchain.addBlock({ data: "testing data 1" });
          blockchain.addBlock({ data: "testing data 2" });
          blockchain.addBlock({ data: "testing data 3" });
          blockchain.addBlock({ data: "testing data 4" });
          blockchain.addBlock({ data: "testing data 5" });
          blockchain.chain[3].lastHash = "someone changed last link";
          expect(Blockchain.isChainValid(blockchain.chain)).toBe(false);
        });
      });
      describe("When there is invalid block in chain", () => {
        it("Has to return false", () => {
          blockchain.addBlock({ data: "testing data 1" });
          blockchain.addBlock({ data: "testing data 2" });
          blockchain.addBlock({ data: "testing data 3" });
          blockchain.addBlock({ data: "testing data 4" });
          blockchain.addBlock({ data: "testing data 5" });
          blockchain.chain[3].data = "someone changed data in blockchain";
          expect(Blockchain.isChainValid(blockchain.chain)).toBe(false);
        });
      });

      describe("When block in the chain has jumped difficulty", () => {
        it("Has to return false", () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(lastHash, timestamp, nonce, data, difficulty);
          const jumpedBlock = new Block({
            lastHash,
            timestamp,
            hash,
            nonce,
            difficulty,
            data
          });
          blockchain.chain.push(jumpedBlock);

          expect(Blockchain.isChainValid(blockchain.chain)).toBe(false);
        });
      });
      describe("When the chain is fine", () => {
        it("Has to return true", () => {
          blockchain.addBlock({ data: "testing data 1" });
          blockchain.addBlock({ data: "testing data 2" });
          blockchain.addBlock({ data: "testing data 3" });
          blockchain.addBlock({ data: "testing data 4" });
          blockchain.addBlock({ data: "testing data 5" });
          expect(Blockchain.isChainValid(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe("alterChain()", () => {
    let logMsg;

    beforeEach(() => {
      logMsg = jest.fn();

      global.console.log = logMsg;
    });
    describe("When new chain isn't longer than old chain", () => {
      beforeEach(() => {
        newChain.chain[0] = { new: "chain" };
        blockchain.alterChain(newChain.chain);
      });
      it("Musn't alter the chain", () => {
        expect(blockchain.chain).toEqual(originalChain);
      });
      it("Has to log an error", () => {
        expect(errorMsg).toHaveBeenCalled();
      });
    });

    describe("When new chain is longer than old chain", () => {
      beforeEach(() => {
        newChain.addBlock({ data: "testing data 1" });
        newChain.addBlock({ data: "testing data 2" });
        newChain.addBlock({ data: "testing data 3" });
        newChain.addBlock({ data: "testing data 4" });
        newChain.addBlock({ data: "testing data 5" });
      });
      describe("Chain is invalid", () => {
        beforeEach(() => {
          newChain.chain[3].hash = "hackerchangedhash";
          blockchain.alterChain(newChain.chain);
        });

        it("Musn't alter the chain", () => {
          expect(blockchain.chain).toEqual(originalChain);
        });
        it("Has to log an error", () => {
          expect(errorMsg).toHaveBeenCalled();
        });
      });
      describe("Chain is valid", () => {
        beforeEach(() => {
          blockchain.alterChain(newChain.chain);
        });

        it("Must alter the chain", () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });
        it("Has to log about altering chain", () => {
          expect(logMsg).toHaveBeenCalled();
        });
      });
    });
    describe("When validateTransaction() is true", () => {
      it("should call validateTransaction()", () => {
        const validTransactionDataTest = jest.fn();

        blockchain.validTransactionData = validTransactionDataTest;
        newChain.addBlock({
          data: "forflagdata"
        });
        blockchain.alterChain(newChain.chain, true);

        expect(validTransactionDataTest).toHaveBeenCalled();
      });
    });
  });

  describe("validTransactionData()", () => {
    let transaction, rewardTransaction, wallet;
    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        receiver: "validdatareceiver",
        amount: 50
      });
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet
      });
    });
    describe("When transaction data is valid", () => {
      it("should return true", () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          true
        );
        expect(errorMsg).not.toHaveBeenCalled();
      });
    });
    describe("When transaction has multiple rewards", () => {
      it("should return false and log error", () => {
        newChain.addBlock({
          data: [transaction, rewardTransaction, rewardTransaction]
        });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
        expect(errorMsg).toHaveBeenCalled();
      });
    });
    describe("When transaction data has at least one invalid output", () => {
      describe("When it isn't reward transaction", () => {
        it("should return false and log error", () => {
          transaction.outputMap[wallet.publicKey] = 9999999999;
          newChain.addBlock({
            data: [transaction, rewardTransaction]
          });
          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMsg).toHaveBeenCalled();
        });
      });
      describe("When it is reward transaction", () => {
        it("should return false and log error", () => {
          rewardTransaction.outputMap[wallet.publicKey] = 10000000000;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMsg).toHaveBeenCalled();
        });
      });
    });
    describe("When transaction data has at least one invalid input", () => {
      it("should return false and log error", () => {
        wallet.balance = 10000;
        const invalidOutputMap = {
          [wallet.publicKey]: 9880,
          testReceiver: 120
        };
        const invalidTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(invalidOutputMap)
          },
          outputMap: invalidOutputMap
        };
        newChain.addBlock({ data: [invalidTransaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
        expect(errorMsg).toHaveBeenCalled();
      });
    });
    describe("Block contains identical transactions", () => {
      it("should return false and log error", () => {
        newChain.addBlock({
          data: [
            transaction,
            transaction,
            transaction,
            transaction,
            rewardTransaction
          ]
        });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
        expect(errorMsg).toHaveBeenCalled();
      });
    });
  });
});
