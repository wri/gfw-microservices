import React, { Component } from 'react';

import '../../css/forgot.scss';
import Page from '../../../common/js/components/Page';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import SubHeader from '../../../common/js/components/SubHeader';
import httpRequest from '../../../common/js/utils/httpRequest';
import forgotStrings from './forgotStrings';
import { PillButton, Link } from '../../../components';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Forgot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      email: '',
    };
  }

  updateEmail = (evt) => {
    this.setState({ email: evt.target.value });
  };

  handleDialog = (title, message) => {
    this.setState({
      showModalLoader: false,
      dialogOpen: true,
      dialogTitle: title,
      dialogMessage: message,
    });
  };

  submit = () => {
    console.log('Submitting reset');
    const { email } = this.state;
    httpRequest
      .fetchJSON('/auth/forgot', { email: email })
      .then((response) => {
        let res;
        try {
          res = JSON.parse(response);
        } catch {
          res = null;
        }
        if (res) {
          if (res.systemMessage?.code === 'LimitExceededException') {
            this.handleDialog(forgotStrings.resetLimit.title, forgotStrings.resetLimit.message);
          } else if (res.systemMessage === 'User does not exist') {
            this.handleDialog(forgotStrings.noUser.title, forgotStrings.noUser.message);
          } else if (res.message === 'Success') {
            window.location.href = '/reset'; // if we succeed, redirect to reset page
          } else if (res.message === 'Resend') {
            this.handleDialog(
              forgotStrings.passwordExpired.title,
              forgotStrings.passwordExpired.message
            );
          }
        } else {
          this.handleDialog(forgotStrings.resetError.title, forgotStrings.resetError.message);
        }
      })
      .catch((err) => {
        console.log(err);
        this.handleDialog(forgotStrings.internalError.title, forgotStrings.internalError.message);
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

    return (
      <Page links={pageOptions.links} active="forgot">
        <Dialog classes={{ paper: 'dialog-paper' }} open={dialogOpen} onClose={action}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>{dialogMessage}</DialogContent>
          <DialogActions>
            <PillButton variant="contained" size="small" autoFocus onClick={action}>
              OK
            </PillButton>
          </DialogActions>
        </Dialog>
        <SubHeader header="GFW Pro Forgot Password" />
        <section className="profile-body">
          <label className="block-label">Enter your email address to reset your password</label>
          <input value={this.state.email} onChange={this.updateEmail} ref="email" />
          <Divider sx={{ mt: 3, mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <PillButton variant="contained" size="small" onClick={this.submit}>
              Reset
            </PillButton>
            <Link href="/">Back</Link>
          </Box>
        </section>
      </Page>
    );
  }
}
