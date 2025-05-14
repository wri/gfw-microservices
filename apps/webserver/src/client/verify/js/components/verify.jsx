import React, { Component } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { West } from '@mui/icons-material';
import '../../css/verify.scss';

import Page from '../../../common/js/components/Page';
import { verifyCodePage } from '../../../common/js/config';
import httpRequest from '../../../common/js/utils/httpRequest';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import getFeatureFlags from '../../../../utils/getFeatureFlags';
import { PillButton, Link } from '../../../components';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Verify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      showModalLoader: false,
    };
    this.tokenInputRef = React.createRef();
  }

  componentDidMount() {
    if (this.tokenInputRef.current) {
      this.tokenInputRef.current.focus();
    }
  }

  handleKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      this.submit();
    }
  };

  updateToken = (evt) => {
    this.setState({ token: evt.target.value });
  };

  resendToken = () => {
    this.setState({ showModalLoader: true }, () => {
      httpRequest.fetchJSON('/auth/resendToken', {}).then((response) => {
        if (response === 'Done') {
          this.setState({
            token: '',
            showModalLoader: false,
          });
        }
      });
    });
  };

  submit = () => {
    const { token } = this.state;
    const request = new XMLHttpRequest();

    request.onload = () => {
      this.handleVerify(request);
    };
    request.onerror = (err) => {
      this.handleError();
      console.log(`Error: ${err}`);
    };
    request.open('POST', '/auth/verifyLogin', true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send(`tokenID=${token}`);
  };

  handleVerify = async (req) => {
    if (req.responseText === 'User') {
      // IF this user is a member of MORE THAN ONE organization, route him to somewhere else
      // somewhere he must choose which company to display
      await getFeatureFlags();
      window.location.href = '/locations';
    } else if (req.responseText === 'Manager') {
      window.location.href = '/pro-manager-list';
    } else if (req.responseText === 'Select Org') {
      window.location.href = '/select';
    } else {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Invalid or expired token entered',
        dialogMessage: 'Enter correct code or click Resend Token to receive a new code.',
      });
    }
  };

  handleError = () => {
    this.setState({
      dialogOpen: true,
      dialogTitle: 'Authentication Error',
      dialogMessage: 'Please try again.',
    });
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    const { token, dialogOpen, dialogTitle, dialogMessage, showModalLoader } = this.state;
    const action = this.shouldCloseDialog;

    return (
      <Page links={pageOptions.links} active="verify">
        <ModalLoader open={showModalLoader} />
        <Dialog classes={{ paper: 'dialog-paper' }} open={dialogOpen} onClose={action}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>{dialogMessage}</DialogContent>
          <DialogActions>
            <PillButton variant="contained" size="small" autoFocus onClick={action}>
              OK
            </PillButton>
          </DialogActions>
        </Dialog>
        <div className="profile-body verify-section">
          <section className="section-container">
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <West fontSize="8" />
              <Link href="/">{verifyCodePage.backButtonLabel}</Link>
            </Box>
            <Box sx={{ mb: 4 }}>
              <h1 className="verify-section__title">{verifyCodePage.pageTitle}</h1>
              <p className="verify-section__prompt">{verifyCodePage.pagePrompt}</p>
            </Box>
            <label htmlFor="verification-code" className="block-label">
              {verifyCodePage.inputLabel}
            </label>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <input
                id="verification-code"
                data-cy="verifyToken"
                value={token}
                onChange={this.updateToken}
                onKeyDown={this.handleKeyPress}
                ref={this.tokenInputRef}
              />
              <PillButton
                variant="contained"
                size="small"
                className="verify-section__verify-button"
                data-cy="verifyButton"
                onClick={this.submit}
              >
                {verifyCodePage.buttonLabel}
              </PillButton>
            </Box>
            <p className="verify-section__resend-prompt">
              {verifyCodePage.newCodeString1}
              <Link onClick={this.resendToken} sx={{ ml: 0.5 }}>
                {verifyCodePage.newCodeString2}
              </Link>
            </p>
          </section>
        </div>
      </Page>
    );
  }
}
