const Block = require("./block.js");
const { GENESIS_DATA } = require("./config");

describe("Block", () => {
  const timestamp = "date-block";
  const lastHash = "date-block-hash";
  const hash = "this-block-hash";
  const data = ["this", "is", "data", "for", "testing"];
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data
  });
  it("Checks if block has all of properties", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
  });

  describe("Genesis Function of Blockchain", () => {
    const genesisBlock = Block.genesis();

    it("Has to return instance of block", () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it("Has to return data from genesis block", () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });
});
