import Page from '../../../common/js/components/Page';
import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import Button from '../../../common/js/components/Button';
import LinkButton from '../../../common/js/components/LinkButton';
import SubHeader from '../../../common/js/components/SubHeader';
import httpRequest from '../../../common/js/utils/httpRequest';
import { authMessages } from '../../../common/js/config';
import '../../css/forgot.scss';

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

  back = () => {
    window.location.href = '/';
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
          if (res.hasOwnProperty('systemMessage') && res.systemMessage.code === 'LimitExceededException') {
            this.setState({
              showModalLoader: false,
              dialogOpen: true,
              dialogTitle: authMessages.resetLimit.title,
              dialogMessage: authMessages.resetLimit.message,
            });
          } else if (res.hasOwnProperty('systemMessage') && res.systemMessage === 'User does not exist') {
            this.setState({
              showModalLoader: false,
              dialogOpen: true,
              dialogTitle: authMessages.noUser.title,
              dialogMessage: authMessages.noUser.message,
            });
          } else if (res.hasOwnProperty('message') && res.message === 'Success') {
            window.location.href = '/reset'; // if we succeed, redirect to reset page
          } else if (res.hasOwnProperty('message') && res.message === 'Resend') {
            this.setState({
              dialogOpen: true,
              dialogTitle: authMessages.passwordExpired.title,
              dialogMessage: authMessages.passwordExpired.message,
            });
          }
        } else {
          this.setState({
            dialogOpen: true,
            dialogTitle: authMessages.resetError.title,
            dialogMessage: authMessages.resetError.message,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          loading: false,
          dialogOpen: true,
          dialogTitle: authMessages.internalError.title,
          dialogMessage: authMessages.internalError.message,
        });
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
    const defaultAction = [<Button variant="primary" label="OK" keyboardFocused={true} onClick={action} />];

    return (
      <Page links={pageOptions.links} active="forgot">
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={action}
        >
          {dialogMessage}
        </Dialog>
        <SubHeader header="GFW Pro Forgot Password" />
        <section className="profile-body">
          <label className="block-label">Enter your email address to reset your password</label>
          <input value={this.state.email} onChange={this.updateEmail} ref="email" />
          <div className="buttons-container">
            <Button variant="primary" onClick={this.submit} label="Reset" />
            <LinkButton onClick={this.back} label="Back" />
          </div>
        </section>
      </Page>
    );
  }
}
