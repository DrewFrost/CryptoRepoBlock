import React, { Component } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import history from "../history";
class MakeTransaction extends Component {
  state = { receiver: "", amount: 0, knownAddresses: [] };

  componentDidMount() {
    fetch(`${document.location.origin}/api/known-addresses`)
      .then(response => response.json())
      .then(json => this.setState({ knownAddresses: json }));
  }

  updateReceiver = event => {
    this.setState({ receiver: event.target.value });
  };
  updateAmount = event => {
    this.setState({ amount: Number(event.target.value) });
  };

  makeTransaction = () => {
    const { receiver, amount } = this.state;
    fetch(`${document.location.origin}/api/transact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver, amount })
    })
      .then(response => response.json())
      .then(json => {
        alert(json.message || json.type);
        history.push("/transaction-pool");
      });
  };
  render() {
    return (
      <div className="MakeTransaction">
        <div>
          <Link to="/">Home</Link>
        </div>
        <div>
          <Link to="/transaction-pool">Transaction Pool</Link>
        </div>
        <h3>Make a Transaction</h3>
        <h4>Known Addresses:</h4>
        {this.state.knownAddresses.map(knownAddress => {
          return (
            <div key={knownAddress}>
              <div>{knownAddress}</div>
              <br />
            </div>
          );
        })}{" "}
        <FormGroup>
          <FormControl
            input="text"
            placeholder="Receiver"
            value={this.state.receiver}
            onChange={this.updateReceiver}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            input="number"
            placeholder="Amount"
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </FormGroup>
        <div>
          <Button variant="outline-dark" onClick={this.makeTransaction}>
            Submit
          </Button>
        </div>
      </div>
    );
  }
}

export default MakeTransaction;
