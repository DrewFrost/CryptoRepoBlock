import React, { Component } from "react";
import {Link} from "react-router-dom";
import logo from "../img/logo.png";
export default class App extends Component {
  state = { walletInfo: { address: "test adress", balance: 2282 } };

  componentDidMount() {
    fetch(`${document.location.origin}/api/wallet-info`)
      .then(response => response.json())
      .then(json => this.setState({ walletInfo: json }));
  }
  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className="App">
        <img className="logo" src={logo} />
        <br/>
        <div>Welcome to the Blockchain</div>
        <br />
        <div><Link to="/blocks">Blocks</Link></div>
        <div><Link to="/make-transaction">Make a Transaction</Link></div>
        <div><Link to="/transaction-pool">Transaction Pool</Link></div>
        <div className="WalletInfo">
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
        </div>
      </div>
    );
  }
}
