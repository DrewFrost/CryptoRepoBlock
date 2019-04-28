// ! Hardcoded data of our blockchain, don't touch it
const INITIAL_BLOCK_DIFFICULTY = 3;

const MINE_RATE = 1000;

const GENESIS_BLOCK_DATA = {
    timestamp: 1,
    lastHash: "none",
    hash: "first-hash-of-blockchain",
    difficulty: INITIAL_BLOCK_DIFFICULTY,
    nonce: 0,
    data: []
};

module.exports = {GENESIS_BLOCK_DATA, MINE_RATE};