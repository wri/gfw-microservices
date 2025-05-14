import React, { Component } from 'react';
import { Box, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import Page from '../../../common/js/components/Page';
import SubHeader from '../../../common/js/components/SubHeader';
import '../../css/change.scss';
import { Link, PillButton } from '../../../components';

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

    return (
      <Page links={pageOptions.links} active="change">
        <Dialog open={dialogOpen} onClose={action} classes={{ paper: 'dialog-paper' }}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>{dialogMessage}</DialogContent>
          <DialogActions>
            <PillButton variant="contained" size="small" autoFocus onClick={action}>
              OK
            </PillButton>
          </DialogActions>
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
          <Divider sx={{ mt: 3, mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <PillButton variant="contained" size="small" onClick={this.toggleShow}>
              {this.state.type === 'input' ? 'Hide' : 'Show'}
            </PillButton>
            <PillButton variant="contained" size="small" onClick={this.submit}>
              Submit
            </PillButton>
            <Link href="/">Back</Link>
          </Box>
        </section>
      </Page>
    );
  }
}
