import Page from '../../../common/js/components/Page';
import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import SubHeader from '../../../common/js/components/SubHeader';
import Button from '../../../common/js/components/Button';
import LinkButton from '../../../common/js/components/LinkButton';
import '../../css/reset.scss';
import httpRequest from '../../../common/js/utils/httpRequest';
import { isPasswordValid } from '../../../common/js/utils/passwordValidations';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Reset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      type: 'password',
      email: '',
      verificationCode: '',
      newPass: '',
      confirm: '',
    };
  }

  updateEmail = (evt) => {
    this.setState({ email: evt.target.value });
  };

  updateVerification = (evt) => {
    this.setState({ verificationCode: evt.target.value });
  };

  updateNew = (evt) => {
    this.setState({ newPass: evt.target.value });
  };

  confirmNew = (evt) => {
    this.setState({ confirm: evt.target.value });
  };

  back = () => {
    window.location.href = '/';
  };

  submit = () => {
    const { email, verifyCode, newPwd } = this.refs;
    const { newPass, confirm } = this.state;
    const matching = newPass === confirm;
    const valid = isPasswordValid(email.value, newPass);

    if (email.value.length === 0) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Enter email',
        dialogMessage: 'Pleaes enter your email address.',
      });
    } else if (verifyCode.value.length === 0) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Enter Verification Code',
        dialogMessage: 'Pleaes enter your verification code.',
      });
    } else {
      if (matching && valid) {
        const body = {
          verifyCode: verifyCode.value,
          newPwd: newPwd.value,
          email: email.value,
        };
        httpRequest
          .fetchJSON('/reset/verify', body)
          .then((response) => {
            if (response === 'true') {
              this.setState({
                dialogOpen: true,
                dialogTitle: 'Success',
                dialogMessage: 'You have successfully reset your password.',
              });
            } else if (response === 'ExpiredCodeException') {
              this.setState({
                dialogOpen: true,
                dialogTitle: 'Verification Code has Expired',
                dialogMessage:
                  'Your verification code has expired. Please contact your organization administrator for support.',
              });
            } else {
              this.setState({
                dialogOpen: true,
                dialogTitle: 'Password reset error',
                dialogMessage:
                  'Please confirm that you have entered the correct email address and verification code.',
              });
            }
          })
          .catch((err) => {
            console.log('Request Error:', err);
            this.setState({
              dialogOpen: true,
              dialogTitle: 'Failure',
              dialogMessage: 'Something internal failed',
            });
          });
      } else if (matching && !valid) {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Password reset error',
          dialogMessage: 'Please confirm your new password meets all of the password requirements.',
        });
      } else if (!matching) {
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Password reset error',
          dialogMessage: 'Please confirm new password matches in the confirm password field.',
        });
      }
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

  render() {
    const { dialogOpen, dialogTitle, dialogMessage } = this.state;
    let action = this.shouldCloseDialog;

    if (dialogTitle === 'Success') {
      action = this.shouldRedirect;
    }
    const defaultAction = [
      <Button variant="primary" label="OK" keyboardFocused={true} onClick={action} />,
    ];
    const matching = this.state.newPass === this.state.confirm;
    return (
      <Page links={pageOptions.links} active="reset">
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
          <p>Enter your email address, verification code, and new password to reset</p>
          <p>Password Requirements</p>
          <ul>
            <li>Must be between 10 and 128 characters</li>
            <li>
              Must contain 3 of the 4 following requirements:
              <ul>
                <li>At least 1 uppercase letter</li>
                <li>At least 1 lowercase letter</li>
                <li>
                  {
                    'At least 1 special character: ^ $ * . [ ] { } ( ) ? - " ! @ # % & /  , > < \' : ; | _ ~ `'
                  }
                </li>
                <li>At least 1 numeric character</li>
              </ul>
            </li>
            <li>Does not contain consecutive characters</li>
            <li>Must be different than your username</li>
          </ul>
          <div className="input-field__block-container">
            <label htmlFor="email-address" className="block-label">
              Your Email Address
            </label>
            <input
              id="email-address"
              className="change-password-input"
              value={this.state.email}
              onChange={this.updateEmail}
              ref="email"
            />
          </div>
          <div className="input-field__block-container">
            <label htmlFor="verification-code" className="block-label">
              Your Verification Code
            </label>
            <input
              id="verification-code"
              className="change-password-input"
              value={this.state.verificationCode}
              onChange={this.updateVerification}
              ref="verifyCode"
            />
          </div>
          <div className="input-field__block-container">
            <label htmlFor="new-password" className="block-label">
              New Password
            </label>
            <input
              id="new-password"
              type={this.state.type}
              className="change-password-input"
              value={this.state.newPass}
              onChange={this.updateNew}
              ref="newPwd"
            />
          </div>
          <div className="input-field__block-container">
            <label htmlFor="confirm-password" className="block-label">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type={this.state.type}
              className={`change-password-input ${matching ? '' : 'broken'}`}
              value={this.state.confirm}
              onChange={this.confirmNew}
            />
          </div>

          <div className="buttons-container">
            <Button
              onClick={this.toggleShow}
              label={this.state.type === 'input' ? 'Hide' : 'Show'}
            />
            <Button variant="primary" onClick={this.submit} label="Submit" />
            <LinkButton onClick={this.back} label="Back" />
          </div>
        </section>
      </Page>
    );
  }
}
