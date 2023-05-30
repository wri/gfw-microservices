import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import Page from '../../../common/js/components/Page';
import { verifyCodePage } from '../../../common/js/config';
import Button from '../../../common/js/components/Button';
import IconArrowLeft from '../../../common/js/components/icon/IconArrowLeft';
import LinkButton from '../../../common/js/components/LinkButton';
import httpRequest from '../../../common/js/utils/httpRequest';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import '../../css/verify.scss';

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

  back = () => {
    window.location.href = '/';
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

  handleVerify = (req) => {
    console.log(req.responseText);
    if (req.responseText === 'User') {
      // IF this user is a member of MORE THAN ONE organization, route him to somewhere else
      // somewhere he must choose which company to display
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

    const defaultAction = [
      <Button variant="primary" label="OK" keyboardFocused onClick={action} />,
    ];

    return (
      <Page links={pageOptions.links} active="verify">
        <ModalLoader open={showModalLoader} />
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={action}
        >
          {dialogMessage}
        </Dialog>
        <div className="profile-body verify-section">
          <section className="section-container">
            <LinkButton
              className="verify-section__back-button back-button"
              onClick={this.back}
              icon={<IconArrowLeft height="10px" />}
              label={verifyCodePage.backButtonLabel}
            />
            <div className="verify-section__header">
              <h1 className="verify-section__title">{verifyCodePage.pageTitle}</h1>
              <p className="verify-section__prompt">{verifyCodePage.pagePrompt}</p>
            </div>
            <div className="verify-section__input-container">
              <label htmlFor="verification-code" className="block-label">
                {verifyCodePage.inputLabel}
              </label>
              <input
                id="verification-code"
                data-cy="verifyToken"
                value={token}
                onChange={this.updateToken}
                onKeyPress={this.handleKeyPress}
                ref={this.tokenInputRef}
              />
              <Button
                className="verify-section__verify-button"
                data-cy="verifyButton"
                variant="primary"
                onClick={this.submit}
                label={verifyCodePage.buttonLabel}
              />
            </div>
            <p className="verify-section__resend-prompt">
              {verifyCodePage.newCodeString1}{' '}
              <LinkButton onClick={this.resendToken} label={verifyCodePage.newCodeString2} />
            </p>
          </section>
        </div>
      </Page>
    );
  }
}
