const Block = require("./block.js");
const cryptoHash = require("./cryptoHash");
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

  describe("Mining Block in Blockchain", () => {
    const lastBlock = Block.genesis();
    const data = "Data Mined";
    const minedBlock = Block.mineBlock({
      lastBlock,
      data
    });
    it("Returns a mined Block", () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it("Has to check if `lastHash` equal to the `hash` of previous Block", () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });
    it("Has to check if data of mined Block equals to data", () => {
      expect(minedBlock.data).toEqual(data);
    });
    it("Has to check if Block has timestamp", () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
    it("Has to create SHA-256 `hash` from inputs", () => {
      expect(minedBlock.hash).toEqual(
        cryptoHash(minedBlock.timestamp, lastBlock.hash, data)
      );
    });
  });
});
