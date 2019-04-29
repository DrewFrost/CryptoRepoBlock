import React, { Component } from "react";

export default class App extends Component {
  state = { walletInfo: { address: "test adress", balance: 2282 } };
  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div>
        <div>Welcome</div>
        <div>Addres: {address}</div>
        <div>Balance: {balance}</div>
      </div>
    );
  }
}
