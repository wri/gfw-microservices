import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import fetch from '../../../../common/js/utils/fetch';
import Button from '../../../../common/js/components/Button';
import { locationsPage } from '../../../../common/js/config';
import LinkButton from '../../../../common/js/components/LinkButton';
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
          modal={true}
          bodyClassName="dialog__body"
          contentClassName="dialog__content"
          onRequestClose={() => onCancel()}
          actions={
            <div className="dialog__footer">
              <Button
                className="dialog__primary-action"
                label={strings.confirm}
                onClick={() => {
                  gtag('event', 'User Removed Folder from Landing Page', {
                    'event_category': 'Landing Page Click',
                  });
                  this._deleteFolder(folder.id);
                }}
                variant="primary"
              />
              <LinkButton label={strings.cancel} onClick={() => onCancel()} />
            </div>
          }
        >
          <div className="dialog__header">
            <h1 className="dialog__title">{strings.deleteFolderTitle}</h1>
            <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
          </div>

          <div className="dialog__prompt">
            {strings.deleteFolderPrompt}
            <span className="DeleteFolder__dialog-folder-name">{folder.name}?</span>
          </div>
          {error !== '' && <div className="DeleteFolder__dialog-error">{error}</div>}
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
        console.log('Error deleting folder.', err);
      });
  };
}
