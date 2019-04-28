const Block = require("../app/block");
const cryptoHash = require("../app/cryptoHash");
const { GENESIS_BLOCK_DATA } = require("../config/config");

describe("Block", () => {
  const timestamp = "date-block";
  const lastHash = "date-block-hash";
  const hash = "this-block-hash";
  const nonce = 1;
  const difficulty = 1;
  const data = ["this", "is", "data", "for", "testing"];
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty
  });
  it("Checks if block has all of properties", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  describe("Genesis Function of Blockchain", () => {
    const genesisBlock = Block.generateGenesis();

    it("Has to return instance of block", () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it("Has to return data from genesis block", () => {
      expect(genesisBlock).toEqual(GENESIS_BLOCK_DATA);
    });
  });

  describe("Mining Block in Blockchain", () => {
    const lastBlock = Block.generateGenesis();
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
        cryptoHash(
          minedBlock.timestamp,
          minedBlock.nonce,
          minedBlock.difficulty,
          lastBlock.hash,
          data
        )
      );
    });
    it("Has to set the hash that is mathces difficulty", () => {
      expect(minedBlock.hash.substring(0, minedBlock.difficulty)).toEqual(
        "0".repeat(minedBlock.difficulty)
      );
    });
  });
});
