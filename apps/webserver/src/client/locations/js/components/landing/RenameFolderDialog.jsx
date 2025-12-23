import { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import fetch from '../../../../common/js/utils/fetch';
import { PillButton } from '../../../../components';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';

import { locationsPage } from '../../../../common/js/config';

import './RenameFolderDialog.scss';

export default class RenameFolderDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      folderName: props.folder.name,
    };
  }

  render() {
    const { isOpen, onCancel, folder } = this.props;
    const { error, folderName } = this.state;

    const strings = locationsPage.lists;

    const confirmDisabled = folderName === '';

    return (
      <Dialog
        open={isOpen}
        onClose={() => onCancel()}
        classes={{
          paper: 'dialog__content',
        }}
      >
        <DialogTitle className="dialog__header">
          <h1 className="dialog__title">{strings.renameFolderTitle}</h1>
          <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
        </DialogTitle>
        <DialogContent className="dialog__body">
          <div className="dialog__prompt">{strings.renameFolderPrompt}</div>
          <div className="RenameFolder__dialog-options">
            <div className="RenameFolder__dialog-options__option">
              <input
                value={folderName}
                onChange={(evt) => this.setState({ folderName: evt.target.value })}
              />
            </div>
          </div>
          <div className="RenameFolder__dialog-error">{error}</div>
        </DialogContent>
        <DialogActions className="dialog__footer" sx={{ display: 'flex', justifyContent: 'start' }}>
          <PillButton
            variant="contained"
            disabled={confirmDisabled}
            onClick={() => {
              gtag('event', 'User Renamed Folder on Landing Page', {
                event_category: 'Landing Page Click',
              });
              this._renameFolder(folder.id, folderName);
            }}
          >
            {strings.confirm}
          </PillButton>
          <PillButton variant="text" color="info" onClick={onCancel}>
            {strings.cancel}
          </PillButton>
        </DialogActions>
      </Dialog>
    );
  }

  _renameFolder = (folder_id, newName) => {
    return fetch({
      url: '/folder/' + folder_id + '/rename_folder',
      method: 'POST',
      body: { folder_name: newName },
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
              {locationsPage.lists.renameFolderSuccessFragment}
              {newName}
            </>
          );
          this.props.onComplete(msg);
        }
      })
      .catch((err) => {
        console.log('Error renaming folder', err);
        this.setState({
          error: locationsPage.lists.renameFolderError,
        });
      });
  };
}
