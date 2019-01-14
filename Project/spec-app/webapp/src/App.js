import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Page from "./Page";
import Access from "./Access";
import Redirect from "react-router-dom/Redirect";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Route exact path="/" component={Page} />
          <Redirect to="/" />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
