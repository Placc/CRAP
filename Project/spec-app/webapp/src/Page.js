import React, { Component } from "react";
import logo from "./logo.png";
import error from "./error.png";
import "./App.css";
import Login from "./Login";
import Access from "./Access";

class Page extends Component {
  isHacked() {
    return (
      this.props.location.search &&
      this.props.location.search.slice(
        this.props.location.search.indexOf("&h=") + "&h=".length
      ) != "0"
    );
  }

  render() {
    return (
      <div className={this.isHacked() ? "BadApp" : "App"}>
        {this.isHacked() ? (
          <img src={error} className="App-logo" alt="error" />
        ) : (
          <img src={logo} className="App-logo" alt="logo" />
        )}
        <p>
          Welcome to the <span className="Name">CRAPPI</span> spec app!
        </p>
        {this.props.location.search ? <Access /> : <Login />}
      </div>
    );
  }
}

export default Page;
