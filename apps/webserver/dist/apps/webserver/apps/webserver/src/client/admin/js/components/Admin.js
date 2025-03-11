import Page from '../../../common/js/components/Page';
import Dialog from 'material-ui/Dialog';
import React, { Component } from 'react';
import Button from '../../../common/js/components/Button';
import '../../css/admin.scss';
import httpRequest from '../../../common/js/utils/httpRequest';

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
      username: '',
      password: '',
    };
  }

  signIn = (username, password) => {
    const body = {
      username,
      password,
    };
    httpRequest
      .fetchJSON('/auth/signinAdmin', body)
      .then((response) => {
        switch (response) {
          case 'RequireNewPassword':
            window.location.href = '/change';
            break;
          case 'ConfirmPassword':
            window.location.href = '/forgot';
            break;
          case 'Authenticated':
            window.location.href = '/verify';
            break;
          default:
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Unable to login',
              dialogMessage: response.message,
            });
        }
      })
      .catch((err) => {
        this.setState({
          loginError: false,
        });
        console.log('Error signinAdmin', err);
      });
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
                <input
                  value={this.state.username}
                  onChange={(evt) => this.setState({ username: evt.target.value })}
                  name="username"
                  className="login-form__input"
                />
              </div>
              <div>
                <div>Password</div>
                <input
                  value={this.state.password}
                  type="password"
                  onChange={(evt) => this.setState({ password: evt.target.value })}
                  name="password"
                  className="login-form__input"
                />
              </div>
              <div>
                <Button
                  variant="primary"
                  onClick={() => this.signIn(this.state.username, this.state.password)}
                  label="Launch GFW Pro"
                />
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
