import Page from '../../../common/js/components/Page';
import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import SubHeader from '../../../common/js/components/SubHeader';
import Button from '../../../common/js/components/Button';
import LinkButton from '../../../common/js/components/LinkButton';
import '../../css/change.scss';

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
    window.location.href = '/';
  };

  submit = () => {
    const { current, newPass, confirm } = this.state;
    const matching = newPass === confirm;
    const valid = isPasswordValid(this.props.userEmail, newPass);

    if (matching && valid) {
      const request = new XMLHttpRequest();
      request.onload = () => {
        if (request.responseText === 'Authenticated') {
          //and onClick of that OK button, send them to '/'
          window.location.href = '/verify';
        } else {
          this.setState({
            dialogOpen: true,
            dialogTitle: 'Error',
            dialogMessage: 'Internal error in changing your password.',
          });
        }
      };
      request.onerror = (err) => {
        console.log('Request Error:', err);
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Failure',
          dialogMessage: 'Something internal failed',
        });
      };
      request.open('POST', '/auth/updatePass', true);
      request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      request.send(`currentPass=${current}&newPass=${newPass}`);
    } else if (matching && !valid) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'New Password is not valid',
        dialogMessage: "Your new password doesn't meet the password requirements - please revise",
      });
    } else if (!matching) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Passwords do not match!',
        dialogMessage: 'Please ensure your passwords match.',
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

  render() {
    const matching = this.state.newPass === this.state.confirm;
    const { dialogOpen, dialogTitle, dialogMessage } = this.state;
    let action = this.shouldCloseDialog;

    if (dialogTitle === 'Success') {
      action = this.shouldRedirect;
    }
    const defaultAction = [<Button variant="primary" label="OK" keyboardFocused={true} onClick={action} />];

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
        <SubHeader header="Fill out this form to reset your password" />
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
          <div>
            <label className="block-label">Current Password</label>
            <input
              type={this.state.type}
              className="change-password-input"
              value={this.state.current}
              onChange={this.updateCurrent}
            />
          </div>
          <div>
            <label className="block-label">New Password</label>
            <input
              type={this.state.type}
              className="change-password-input"
              value={this.state.newPass}
              onChange={this.updateNew}
            />
          </div>
          <div>
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
            <LinkButton onClick={this.back} label="Back" />
          </div>
        </section>
      </Page>
    );
  }
}
