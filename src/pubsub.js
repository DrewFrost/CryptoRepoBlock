const redis = require("redis");

const CHANNELS = {
  //TEST is unused was only for testing purposes
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION"
};

//Pubsub pattern is used to implement decentralized connection where publisher
// can send messages to subscribers and subcribers receives messages
class PubSub {
  constructor({ blockchain, transactionPool, redisUrl }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.publisher = redis.createClient(redisUrl);
    this.subscriber = redis.createClient(redisUrl);

    this.subToChannels();
    this.subscriber.on("message", (channel, message) =>
      this.manageMessage(channel, message)
    );
  }
  // Managing messages of network
  manageMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}.`);

    const parsedMessage = JSON.parse(message);
    switch (channel) {
      //Switch case makes it easy to add new channels
      //and use channells depending on operation done
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.alterChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage
          });
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        return;
    }
  }
  //Automaticaly subscribe subscribers to all existing chanells
  // so it is easy to add new channels
  subToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }
  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }
  //Transmiting chain to all other peers
  transmitChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  transmitTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub;
