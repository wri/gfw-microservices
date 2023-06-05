import Page from '../../../common/js/components/Page';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import React, { Component } from 'react';
import Button from '../../../common/js/components/Button';
import '../../css/admin.scss';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Admin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginError: false,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
    };
  }

  handleKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      this.signIn();
    }
  };

  signIn = () => {
    const { username, password } = this.refs;
    var request = new XMLHttpRequest();
    request.onload = () => {
      console.log('request', request);
      console.log(request.responseText);

      // //TODO: now we need to look at the request, and see if it is the manager's first time:
      // // if it is, re-route them to /verify to verify their token and then through. If not, send them through
      // if (request.responseText === 'Login success') {
      //   this.setState({
      //     loginError: false
      //   });
      //   window.location.href = '/profile';
      // } else {
      //   this.setState({
      //     loginError: true
      //   });
      // }

      if (request.responseText === 'RequireNewPassword') {
        window.location.href = '/change';
      } else if (request.responseText === 'ConfirmPassword') {
        window.location.href = '/forgot'; //TODO: Are these routes correct??
      } else if (request.responseText === 'Authenticated') {
        window.location.href = '/verify';
      } else {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Unable to login',
          dialogMessage: request.message,
        });
      }
    };
    request.onerror = (err) => {
      this.setState({
        loginError: false,
      });
      console.log(`Error: ${err}`);
    };
    request.open('POST', '/auth/signinAdmin', true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.send(`username=${username.input.value}&password=${password.input.value}`);
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    const { dialogOpen, dialogTitle, dialogMessage } = this.state;
    const defaultAction = [
      <Button
        variant="primary"
        label="OK"
        keyboardFocused={true}
        onClick={this.shouldCloseDialog}
      />,
    ];
    return (
      <Page links={pageOptions.links} active="admin">
        <div className="profile-body">
          <Dialog
            paperClassName="dialog-paper"
            open={dialogOpen}
            title={dialogTitle}
            actions={defaultAction}
            onRequestClose={this.shouldCloseDialog}
          >
            {dialogMessage}
          </Dialog>
          <div>
            <div>
              <div>
                <div>Username</div>
                <TextField onKeyPress={this.handleKeyPress} ref="username" name="username" />
              </div>
              <div>
                <div>Password</div>
                <TextField
                  type="password"
                  onKeyPress={this.handleKeyPress}
                  ref="password"
                  name="password"
                />
              </div>
              <div>
                <Button variant="primary" onClick={this.signIn} label="Launch GFW Pro" />
              </div>
              {this.state.loginError ? (
                <div className="login__error">There was a login error!</div>
              ) : null}
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
