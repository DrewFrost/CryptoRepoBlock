import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";
import { setInterval } from "timers";
import history from "../history";

const POOL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
  state = { transactionPoolMap: {} };

  fetchTransactionPoolMap = () => {
    fetch(`${document.location.origin}/api/transaction-pool-map`)
      .then(response => response.json())
      .then(json => this.setState({ transactionPoolMap: json }));
  };

  fetchMineTransactions = () =>{
      fetch(`${document.location.origin}/api/mine-transactions`)
      .then(response => {
          if(response.status === 200 ){
              alert("Success");
              history.push("/blocks")
          }else{
              alert("Mine transactions didn't compelete")
          }
      })
  }

  componentDidMount() {
    this.fetchTransactionPoolMap();

    this.fetchPoolMapInterval = setInterval(
      () => this.fetchTransactionPoolMap(),
      POOL_INTERVAL_MS
    );
  }
  componentWillUnmount() {
    clearInterval(this.fetchPoolMapInterval);
  }

  render() {
    return (
      <div className="TransactionPool">
        <div>
          <Link to="/">Home</Link>
        </div>
        <h3>Transaction Pool</h3>
        {Object.values(this.state.transactionPoolMap).map(transaction => {
          return (
            <div key={transaction.id}>
              <hr />
              <Transaction transaction={transaction} />
            </div>
          );
        })}
        <hr/>
        <Button variant="dark" onClick={this.fetchMineTransactions}>Mine the Transactions</Button>
      </div>
    );
  }
}

export default TransactionPool;
