const express = require("express");
const Blockchain = require("./app/blockchain");

const app = express();
const blockchain = new Blockchain();

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App is listening on localhost:${PORT}`);
});
