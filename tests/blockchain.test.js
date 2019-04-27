const Blockchain = require("../app/blockchain");
const Block = require("../app/block");

describe("Blockchain", () => {
  let blockchain;
  beforeEach(() => {
    blockchain = new Blockchain();
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
    describe("When chain starts with genesis block and has blocks", () => {
      describe("When last hash link has changed", () => {
        it("Has to return false", () => {
          blockchain.addBlock({ data: "testing data 1" });
          blockchain.addBlock({ data: "testing data 2" });
          blockchain.addBlock({ data: "testing data 3" });
          blockchain.addBlock({ data: "testing data 4" });
          blockchain.addBlock({ data: "testing data 5" });
          blockchain.chain[3].lastHash = "someone changed last link";
          expect(blockchain.isChainValid(blockchain.chain)).toBe(false);
        });
      });
      describe("Instance when chain doesn't start with genesis block", () => {
        it("Has to return false", () => {
          blockchain.chain[0] = { data: "not our genesis block" };
          expect(blockchain.isChainValid(blockchain.chain)).toBe(false);
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
          expect(blockchain.isChainValid(blockchain.chain)).toBe(false);
        });
      });
      describe("When the chain is fine", () => {
        it("Has to return true", () => {
          blockchain.addBlock({ data: "testing data 1" });
          blockchain.addBlock({ data: "testing data 2" });
          blockchain.addBlock({ data: "testing data 3" });
          blockchain.addBlock({ data: "testing data 4" });
          blockchain.addBlock({ data: "testing data 5" });
          expect(blockchain.isChainValid(blockchain.chain)).toBe(true);
        });
      });
    });
  });
});
