import React, { Component } from "react";
import Blocks from "./Blocks";
import logo from "../img/logo.png";
export default class App extends Component {
  state = { walletInfo: { address: "test adress", balance: 2282 } };

  componentDidMount() {
    fetch("http://localhost:3000/api/wallet-info")
      .then(response => response.json())
      .then(json => this.setState({ walletInfo: json }));
  }
  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className="App">
        <img className="logo" src={logo} />
        <div>Welcome</div>
        <br/>
        <div className="WalletInfo">
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
        </div>
        <br/>
        <Blocks/>
      </div>
    );
  }
}
