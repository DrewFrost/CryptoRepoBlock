import React from "react";
import { render } from "react-dom";
import { Router, Switch, Route } from "react-router-dom";
import history from "./history";
import "./index.css";

import App from "./components/App";
import Blocks from "./components/Blocks";
import MakeTransaction from "./components/MakeTransaction";
import TransactionPool from "./components/TransactionPool";
render(
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/blocks" component={Blocks} />
      <Route path="/make-transaction" component={MakeTransaction}/>
      <Route path="/transaction-pool" component={TransactionPool}/>
    </Switch>
  </Router>,
  document.getElementById("root")
);
