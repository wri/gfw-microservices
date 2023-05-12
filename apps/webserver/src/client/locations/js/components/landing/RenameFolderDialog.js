import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import fetch from '../../../../common/js/utils/fetch';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
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
        modal={true}
        bodyClassName="dialog__body"
        contentClassName="dialog__content"
        onRequestClose={() => onCancel()}
        actions={
          <div className="dialog__footer">
            <Button
              className="dialog__primary-action"
              label={strings.confirm}
              disabled={confirmDisabled}
              onClick={() => {
                ga('send', 'event', 'Landing Page Click', 'User Renamed Folder on Landing Page');
                this._renameFolder(folder.id, folderName);
              }}
              variant="primary"
            />
            <LinkButton label={strings.cancel} onClick={() => onCancel()} />
          </div>
        }
      >
        <div className="dialog__header">
          <h1 className="dialog__title">{strings.renameFolderTitle}</h1>
          <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
        </div>
        <div className="dialog__prompt">{strings.renameFolderPrompt}</div>
        <div className="RenameFolder__dialog-options">
          <div className="RenameFolder__dialog-options__option">
            <input value={folderName} onChange={(evt) => this.setState({ folderName: evt.target.value })} />
          </div>
        </div>
        <div className="RenameFolder__dialog-error">{error}</div>
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
