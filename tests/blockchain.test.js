const Blockchain = require("../app/blockchain");
const Block = require("../app/block");

describe("Blockchain", () => {
  let blockchain, newChain, originalChain;
  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
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
    describe("When new chain isn't longer than old chain", () => {
      beforeEach(() => {
        newChain.chain[0] = { new: "chain" };

        blockchain.alterChain(newChain.chain);
      });
      it("Musn't alter the chain", () => {
        expect(blockchain.chain).toEqual(originalChain);
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
      });
      describe("Chain is valid", () => {
        it("Must alter the chain", () => {
          expect(blockchain.chain).toEqual(originalChain);
        });
      });
    });
  });
});
