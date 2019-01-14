import React, { Component } from "react";
import "./App.css";
import withRouter from "react-router/withRouter";

class Access extends Component {
  isHacked() {
    return (
      this.props.location.search.slice(
        this.props.location.search.indexOf("&h=") + "&h=".length
      ) != "0"
    );
  }

  render() {
    return (
      <div className={this.isHacked() ? "BadApp" : "App"}>
        {this.isHacked() ? (
          <p>Oh no! You might have been attacked...</p>
        ) : (
          <p>Congratulations! You have not been attacked!</p>
        )}
      </div>
    );
  }
}

export default withRouter(Access);
