import { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import * as httpRequest from '../../../../common/js/utils/httpRequest';
import { Link, PillButton } from '../../../../components';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import { FailedPopupDialog } from './FailedPopupDialog';

import { locationsPage } from '../../../../common/js/config';

import './DeleteListDialog.scss';

export default class DeleteListDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteList: false,
      deleteListFailed: false,
    };
  }

  onFailedClose = () => {
    this.setState({ deleteListFailed: !this.state.deleteListFailed });
    this.props.onComplete();
  };

  render() {
    const { isOpen, list, onCancel } = this.props;
    const { deleteListFailed } = this.state;

    const strings = locationsPage.lists;

    return (
      <>
        <Dialog
          open={isOpen}
          onClose={() => onCancel()}
          classes={{
            paper: 'dialog__content',
          }}
        >
          <DialogTitle className="dialog__header">
            <h1 className="dialog__title">{strings.deleteListDialog.title}</h1>
            <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
          </DialogTitle>
          <DialogContent className="dialog__body">
            <span className="DeleteList__dialog-list-name">{list.list_name}</span>
            {strings.deleteListDialog.text}
          </DialogContent>
          <DialogActions
            className="dialog__footer"
            sx={{ display: 'flex', justifyContent: 'start' }}
          >
            <PillButton
              variant="contained"
              onClick={() => {
                gtag('event', 'User Removed List from Landing Page', {
                  event_category: 'Landing Page Click',
                });
                this._deleteList(list.id);
              }}
            >
              {strings.deleteListDialog.confirm}
            </PillButton>
            <Link onClick={() => onCancel()}>{strings.deleteListDialog.cancel}</Link>
          </DialogActions>
        </Dialog>
        {deleteListFailed && (
          <FailedPopupDialog
            open={deleteListFailed}
            title={`${list.list_name} is not deleted`}
            message={'This request has failed on the server. Please try again at another time.'}
            onRequestClose={this.onFailedClose}
            onOkButtonPress={this.onFailedClose}
          />
        )}
      </>
    );
  }

  _deleteList = (list_id) => {
    httpRequest
      .fetchJSON('/locations/lockList', { list_id: list_id })
      .then(() => {
        httpRequest
          .fetchJSON('/locations/deleteList', { list_id: list_id })
          .then(() => {
            window.location = '/locations';
          })
          .catch((err) => {
            this.setState({
              deleteList: false,
              deleteListFailed: true,
            });
            console.log('DeleteList action error', err);
          });
      })
      .catch((err) => {
        this.setState({
          deleteList: false,
          deleteListFailed: true,
        });
        console.log('LockList action error', err);
      });
  };
}
