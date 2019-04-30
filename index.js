const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");

const PubSub = require("./src/pubsub");
const Blockchain = require("./src/blockchain/blockchain");
const Wallet = require("./src/wallet/wallet");
const TransactionPool = require("./src/wallet/transactionPool");
const Miner = require("./src/miner");

const isDevelopment = process.env.ENV === "development";
const REDIS_URL = isDevelopment
  ? "redis://127.0.0.1:6379"
  : "redis://h:pd725d1c64913dcec1f259b4faf14d1dd3f5b29fc051386d69117274736d8c5ba@ec2-3-92-100-235.compute-1.amazonaws.com:32089";
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = isDevelopment?
`http://localhost:${DEFAULT_PORT}`
:`https://radiant-oasis-26933.herokuapp.com`;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const miner = new Miner({ blockchain, transactionPool, wallet, pubsub });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client/build")));
//Showing existing blocks
app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.get("/api/blocks/length", (req, res) => {
  res.json(blockchain.chain.length);
});

app.get("/api/blocks/:id", (req, res) => {
  const { id } = req.params;
  const { length } = blockchain.chain;

  const reversedBlocks = blockchain.chain.slice().reverse();

  let startIndex = (id - 1) * 5;
  let endIndex = id * 5;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(reversedBlocks.slice(startIndex, endIndex));

});

//mining blocks to the blockchain
app.post("/api/mine", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });
  pubsub.transmitChain();
  res.redirect("/api/blocks");
});

//Transacting to another user
app.post("/api/transact", (req, res) => {
  const { amount, receiver } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey
  });
  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, receiver, amount });
    } else {
      transaction = wallet.createTransaction({
        receiver,
        amount,
        chain: blockchain.chain
      });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }

  transactionPool.setTransaction(transaction);
  pubsub.transmitTransaction(transaction);
  res.json({ type: "success", transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transactions", (req, res) => {
  miner.mineTransactions();
  res.redirect("/api/blocks");
});

app.get("/api/wallet-info", (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({
      chain: blockchain.chain,
      address
    })
  });
});

app.get("/api/known-addresses", (req, res) => {
  const addressMap = {};

  for (let block of blockchain.chain) {
    for (let transaction of block.data) {
      const receiver = Object.keys(transaction.outputMap);

      receiver.forEach(receiver => (addressMap[receiver] = receiver));
    }
  }
  res.json(Object.keys(addressMap));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

// Synchronizing peers with main chain
const syncWithNetwork = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        console.log("Syncing chain with", rootChain);
        blockchain.alterChain(rootChain);
      }
    }
  );
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);

        console.log("Syncing transactions with ", rootTransactionPoolMap);
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};
if (isDevelopment) {
  const walletOne = new Wallet();
  const walletTwo = new Wallet();

  const generateWalletTransaction = ({ wallet, receiver, amount }) => {
    const transaction = wallet.createTransaction({
      receiver,
      amount,
      chain: blockchain.chain
    });

    transactionPool.setTransaction(transaction);
  };

  const walletAction = () =>
    generateWalletTransaction({
      wallet,
      receiver: walletOne.publicKey,
      amount: 5
    });

  const walletOneAction = () =>
    generateWalletTransaction({
      wallet: walletOne,
      receiver: walletTwo.publicKey,
      amount: 10
    });

  const walletTwoAction = () =>
    generateWalletTransaction({
      wallet: walletTwo,
      receiver: wallet.publicKey,
      amount: 15
    });

  for (let i = 0; i < 30; i++) {
    if (i % 3 === 0) {
      walletAction();
      walletOneAction();
    } else if (i % 3 === 1) {
      walletAction();
      walletTwoAction();
    } else {
      walletOneAction();
      walletTwoAction();
    }

    miner.mineTransactions();
  }
}

let PEER_PORT;
//Creating new peeers
if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`App is listening on localhost:${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    syncWithNetwork();
  }
});
