import { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import fetch from '../../../../common/js/utils/fetch';
import errorLogger from '../../../../common/js/utils/errorLogger';
import { PillButton } from '../../../../components';
import { locationsPage } from '../../../../common/js/config';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';

import './DeleteFolderDialog.scss';

export default class DeleteFolderDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
    };
  }

  render() {
    const { isOpen, onCancel, folder } = this.props;
    const { error } = this.state;
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
            <h1 className="dialog__title">{strings.deleteFolderTitle}</h1>
            <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
          </DialogTitle>

          <DialogContent className="dialog__body">
            <div className="dialog__prompt">
              {strings.deleteFolderPrompt}
              <span className="DeleteFolder__dialog-folder-name">{folder.name}?</span>
            </div>
            {error !== '' && <div className="DeleteFolder__dialog-error">{error}</div>}
          </DialogContent>

          <DialogActions
            className="dialog__footer"
            sx={{ display: 'flex', justifyContent: 'start' }}
          >
            <PillButton
              variant="contained"
              size="small"
              onClick={() => {
                gtag('event', 'User Removed Folder from Landing Page', {
                  event_category: 'Landing Page Click',
                });
                this._deleteFolder(folder.id);
              }}
            >
              {strings.confirm}
            </PillButton>
            <PillButton variant="text" size="small" color="info" onClick={onCancel}>
              {strings.cancel}
            </PillButton>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  _deleteFolder = (folder_id) => {
    fetch({
      url: '/folder/' + folder_id + '/delete_folder',
      method: 'DELETE',
      body: {},
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.error) {
          this.setState({
            error: response.error,
          });
          return;
        } else {
          const msg = (
            <>
              <b>{this.props.folder.name}</b>
              {locationsPage.lists.deleteFolderSuccessFragment}
            </>
          );
          this.props.onComplete(msg);
        }
      })
      .catch((err) => {
        this.setState({
          error: locationsPage.lists.deleteFolderError,
        });
        errorLogger.error('Error deleting folder', {
          component: 'DeleteFolderDialog',
          action: 'deleteFolder',
          error: err,
          folderId: this.props.folder?.id,
        });
      });
  };
}
