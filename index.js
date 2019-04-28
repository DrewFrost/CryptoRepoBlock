const express = require("express");
const bodyParser = require("body-parser");
const PubSub = require("./pubsub");
const Blockchain = require("./app/blockchain");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => pubsub.transmitChain(), 1000);

app.use(bodyParser.json());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });
  pubsub.transmitChain();
  res.redirect("/api/blocks");
});

const DEFAULT_PORT = 3000;

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`App is listening on localhost:${PORT}`);
});
