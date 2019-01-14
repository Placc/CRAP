import React, { Component } from "react";
import "./Login.css";
import { isEmpty } from "lodash";
import { getHash } from "common/util/funs";
import withRouter from "react-router-dom/withRouter";

class Login extends Component {
  handleSubmit = event => {
    event.preventDefault();

    if (isEmpty(event.target[0].value) || isEmpty(event.target[1].value)) {
      return;
    }

    const user = event.target[0].value;
    const password = getHash(event.target[1].value);

    this.props.history.push(
      `/?user=${user}&password=${password}&h=${
        password == event.target[1].value ? 1 : 0
      }`
    );
  };

  reset() {
    eval("console.log('We called eval, did you detect it? ;-)')");
  }

  render() {
    return (
      <div class="form">
        <form
          class="login-form"
          onSubmit={this.handleSubmit}
          onReset={this.reset}
        >
          <input type="text" placeholder="username" />
          <input type="password" placeholder="password" />
          <button type="submit">login</button>
          <button class="link" type="reset">
            reset
          </button>
        </form>
      </div>
    );
  }
}

export default withRouter(Login);
