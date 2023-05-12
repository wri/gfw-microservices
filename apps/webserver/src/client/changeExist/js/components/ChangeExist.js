import Page from '../../../common/js/components/Page';
import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import SubHeader from '../../../common/js/components/SubHeader';
import Button from '../../../common/js/components/Button';
import LinkButton from '../../../common/js/components/LinkButton';
import '../../../change/css/change.scss';

import { isPasswordValid } from '../../../common/js/utils/passwordValidations';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Change extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      type: 'password',
      current: '',
      newPass: '',
      confirm: '',
      updatingAccount: false,
    };
  }

  updateCurrent = (evt) => {
    this.setState({ current: evt.target.value });
  };

  updateNew = (evt) => {
    this.setState({ newPass: evt.target.value });
  };

  confirmNew = (evt) => {
    this.setState({ confirm: evt.target.value });
  };

  back = () => {
    window.location.href = '/profile';
  };

  submit = () => {
    const { current, newPass, confirm } = this.state;
    // New password and confirm new password match check
    const matching = newPass === confirm;
    // New password and old password match check
    const same = matching && newPass === current;
    // New password meets requirements check
    const valid = isPasswordValid(this.props.userEmail, newPass, current);

    // New password matches with confirm, AND is valid, AND is not same as current password
    if (matching && valid && !same) {
      const request = new XMLHttpRequest();
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Updating password..',
        dialogMessage: '',
        updatingAccount: true,
      });
      request.onload = () => {
        if (request.responseText === 'PasswordChanged') {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Password has been changed',
            dialogMessage: 'Your password has been successfully changed.',
            updatingAccount: false,
          });
        } else {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Password reset error',
            dialogMessage:
              'Please confirm that your current password is entered correctly, your new password meets all of the password requirements, and that your new password matches in the confirm password field.',
            updatingAccount: false,
          });
        }
      };
      request.onerror = (err) => {
        console.log('Request Error:', err);
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Failure',
          dialogMessage: 'Something internal failed',
          updatingAccount: false,
        });
      };
      request.open('POST', '/auth/updateExistingPass', true);
      request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      request.send(`currentPass=${current}&newPass=${newPass}`);

      // New password matches with confirm but is not valid
    } else if (matching && !valid) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'New Password is not valid',
        dialogMessage: "Your new password doesn't meet the password requirements - please revise",
        updatingAccount: false,
      });

      // New password matches with current AND matches with current password
    } else if (same && matching) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Invalid Password',
        dialogMessage: 'New password cannot be your current password.',
        updatingAccount: false,
      });

      // New password does not match with confirm
    } else if (!matching) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Passwords do not match!',
        dialogMessage: 'Please ensure your passwords match.',
        updatingAccount: false,
      });
    }
  };

  toggleShow = () => {
    this.setState({
      type: this.state.type === 'input' ? 'password' : 'input',
    });
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  shouldRedirect = () => {
    window.location.href = '/';
  };

  redirectToProfile = () => {
    window.location.href = '/profile';
  };

  render() {
    const matching = this.state.newPass === this.state.confirm;
    const { dialogOpen, dialogTitle, dialogMessage } = this.state;
    let action = this.shouldCloseDialog;

    if (dialogTitle === 'Success') {
      action = this.shouldRedirect;
    } else if (dialogTitle === 'Password has been changed') {
      action = this.redirectToProfile;
    }

    const defaultAction = this.state.updatingAccount
      ? []
      : [<Button variant="primary" label="OK" keyboardFocused={true} onClick={action} />];

    return (
      <Page links={pageOptions.links} active="change">
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={action}
        >
          {dialogMessage}
        </Dialog>
        <SubHeader header="Password Reset" />
        <section className="profile-body">
          <p>Password Requirements</p>
          <ul>
            <li>Must be between 10 and 128 characters</li>
            <li>
              Must contain 3 of the 4 following requirements:
              <ul>
                <li>At least 1 uppercase letter</li>
                <li>At least 1 lowercase letter</li>
                <li>{'At least 1 special character: ^ $ * . [ ] { } ( ) ? - " ! @ # % & /  , > < \' : ; | _ ~ `'}</li>
                <li>At least 1 numeric character</li>
              </ul>
            </li>
            <li>Does not contain consecutive characters</li>
            <li>Must be different than your username</li>
          </ul>
          <div className="input-field__block-container">
            <label className="block-label">Current Password</label>
            <input
              type={this.state.type}
              className="change-password-input"
              value={this.state.current}
              onChange={this.updateCurrent}
            />
          </div>
          <div className="input-field__block-container">
            <label className="block-label">New Password</label>
            <input
              type={this.state.type}
              className="change-password-input"
              value={this.state.newPass}
              onChange={this.updateNew}
            />
          </div>
          <div className="input-field__block-container">
            <label className="block-label">Confirm Password</label>
            <input
              type={this.state.type}
              className={`change-password-input ${matching ? '' : 'broken'}`}
              value={this.state.confirm}
              onChange={this.confirmNew}
            />
          </div>
          <div className="buttons-container">
            <Button onClick={this.toggleShow} label={this.state.type === 'input' ? 'Hide' : 'Show'} />
            <Button variant="primary" onClick={this.submit} label="Submit" />
            <LinkButton className="back-button" label="Back" onClick={this.back} />
          </div>
        </section>
      </Page>
    );
  }
}
