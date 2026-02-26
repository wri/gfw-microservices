import Page from '../../../common/js/components/Page';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PillButton } from '../../../components';
import { Component } from 'react';
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
    return (
      <Page links={pageOptions.links} active="admin">
        <div className="profile-body">
          <h3>Pro Manager Login</h3>
          <Dialog
            classes={{ paper: 'dialog-paper' }}
            open={dialogOpen}
            onClose={this.shouldCloseDialog}
          >
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>{dialogMessage}</DialogContent>
            <DialogActions>
              <PillButton
                variant="contained"
                color="primary"
                size="small"
                onClick={this.shouldCloseDialog}
                autoFocus
              >
                OK
              </PillButton>
            </DialogActions>
          </Dialog>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                this.signIn(this.state.username, this.state.password);
              }}
            >
              <div>
                <label for="username" className="login-form__label">
                  Username
                </label>
                <input
                  value={this.state.username}
                  onChange={(evt) => this.setState({ username: evt.target.value })}
                  name="username"
                  id="username"
                  className="login-form__input"
                />
              </div>
              <div>
                <label for="password" className="login-form__label">
                  Password
                </label>
                <input
                  value={this.state.password}
                  type="password"
                  onChange={(evt) => this.setState({ password: evt.target.value })}
                  name="password"
                  id="password"
                  className="login-form__input"
                />
              </div>
              <div>
                <PillButton variant="contained" color="primary" type="submit" size="small">
                  Launch GFW Pro
                </PillButton>
              </div>
              {this.state.loginError ? (
                <div className="login__error">There was a login error!</div>
              ) : null}
            </form>
          </div>
        </div>
      </Page>
    );
  }
}
