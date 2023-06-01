import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import MenuItem from 'material-ui/MenuItem';
import fetch from '../../../../common/js/utils/fetch';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';

import { locationsPage } from '../../../../common/js/config';

import './ManageListFolderDialog.scss';

const OPTIONS = {
  CREATE: 'create',
  MOVE: 'move',
  REMOVE: 'remove',
};

const getInitialState = (props) => ({
  error: '',
  option: getInitialOption(props),
  existingFolder: undefined,
  folderName: '',
});

const getInitialOption = (props) => (props.folders.length === 0 ? OPTIONS.CREATE : OPTIONS.MOVE);

export default class ManageListFolderDialog extends Component {
  constructor(props) {
    super(props);

    this.state = getInitialState(props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen && !this.props.isOpen) {
      this.setState(getInitialState(this.props));
    } else if (prevProps.folders !== this.props.folders) {
      this.setState({ option: getInitialOption(this.props) });
    }
  }

  render() {
    const { isOpen, folders, list, onCancel, onComplete } = this.props;
    const { error, existingFolder, folderName, option } = this.state;

    const strings = locationsPage.lists.manageFolderDialog;

    const isInFolder = !!list.folder;
    const confirmDisabled =
      (option === OPTIONS.CREATE && folderName === '') ||
      (option === OPTIONS.MOVE && existingFolder === undefined);
    const folderOptions = folders
      .map((folder, idx) =>
        folder !== list.folder ? (
          <option value={idx} key={idx}>
            {folder.name}
          </option>
        ) : null
      )
      .filter((folder) => folder !== null);

    return (
      <React.Fragment>
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
                  gtag('event', 'User Added List to Folder on Landing Page', {
                    event_category: 'Landing Page Click',
                  });
                  this._confirm();
                }}
                variant="primary"
              />
              <LinkButton label={strings.cancel} onClick={() => onCancel()} />
            </div>
          }
        >
          <div className="dialog__header">
            <h1 className="dialog__title">{isInFolder ? strings.manageTitle : strings.addTitle}</h1>
            <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
          </div>
          <div className="dialog__prompt">
            {isInFolder ? strings.move1 : strings.add1}{' '}
            <span className="AddToFolder__dialog-list-name">{list.list_name}</span>{' '}
            {isInFolder ? strings.move2 : strings.add2}
          </div>
          <div className="AddToFolder__dialog-options">
            {folders.length > 0 && (
              <div className="AddToFolder__dialog-options__option">
                <input
                  type="radio"
                  name="addCreateOrRemove"
                  id="addToExistingFolder"
                  checked={option === OPTIONS.MOVE}
                  onChange={(evt) => {
                    if (evt.target.checked) {
                      this.setState({ option: OPTIONS.MOVE });
                    }
                  }}
                />
                <label htmlFor="addToExistingFolder">{strings.addToExisting}</label>
                {option == OPTIONS.MOVE && (
                  <select
                    value={
                      this.state.existingFolder
                        ? this.props.folders.indexOf(this.state.existingFolder)
                        : ''
                    }
                    onChange={(evt) =>
                      this.setState({ existingFolder: this.props.folders[evt.target.value] })
                    }
                  >
                    <option value="">{strings.foldersSelectPlaceholder}</option>
                    {folderOptions}
                  </select>
                )}
              </div>
            )}
            <div className="AddToFolder__dialog-options__option">
              {(isInFolder || folders.length > 0) && (
                <input
                  type="radio"
                  name="addCreateOrRemove"
                  id="addToNewFolder"
                  checked={option === OPTIONS.CREATE}
                  onChange={(evt) => {
                    if (evt.target.checked) {
                      this.setState({ option: OPTIONS.CREATE });
                    }
                  }}
                />
              )}
              <label htmlFor={folders.length > 0 ? 'addToNewFolder' : null}>
                {strings.createNew}
              </label>
              {option === OPTIONS.CREATE && (
                <input
                  value={folderName}
                  onChange={(evt) => this.setState({ folderName: evt.target.value })}
                />
              )}
            </div>
            {isInFolder && (
              <div className="AddToFolder__dialog-options__option">
                <input
                  type="radio"
                  name="addCreateOrRemove"
                  id="removeFromFolder"
                  checked={option === OPTIONS.REMOVE}
                  onChange={(evt) => {
                    if (evt.target.checked) {
                      this.setState({ option: OPTIONS.REMOVE });
                    }
                  }}
                />
                <label htmlFor="removeFromFolder">{strings.removeFromFolder}</label>
              </div>
            )}
          </div>
          <div className="AddToFolder__dialog-error">{error}</div>
        </Dialog>
      </React.Fragment>
    );
  }

  _confirm = () => {
    const { option } = this.state;
    const isInFolder = !!this.props.list.folder;
    if (isInFolder && option !== OPTIONS.REMOVE) {
      this._removeFromFolder().then(() => this._performAction());
    } else {
      this._performAction();
    }
  };

  _performAction = () => {
    const { option } = this.state;
    const isInFolder = !!this.props.list.folder;
    const strings = locationsPage.lists.manageFolderDialog;

    const promise =
      option === OPTIONS.CREATE
        ? this._addToFolder()
        : option === OPTIONS.MOVE
        ? this._addList(this.state.existingFolder)
        : this._removeFromFolder();

    promise.then((folder) => {
      const msg = (
        <>
          <b>{this.props.list.list_name}</b>
          {option === OPTIONS.REMOVE
            ? strings.removed1
            : isInFolder
            ? strings.moved1
            : strings.added1}
          <b>{folder.name}</b>
          {option === OPTIONS.REMOVE
            ? strings.removed2
            : isInFolder
            ? strings.moved2
            : strings.added2}
        </>
      );
      this.props.onComplete(msg);
    });
  };

  _addToFolder = () => {
    gtag('event', 'User moves list from new folder to newly created folder', {
      event_category: 'Landing Page Click',
    });

    return fetch({
      url: '/folder',
      method: 'POST',
      body: { name: this.state.folderName },
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.error) {
          this.setState({
            error: response.error,
          });
          return null;
        } else {
          return this._addList(response[0]);
        }
      })
      .catch((err) => {
        console.log('Error creating folder', err);
        this.setState({
          error: locationsPage.lists.manageFolderDialog.errorFolder,
        });
      });
  };

  _addList = (folder) => {
    gtag('event', 'User moves list from one folder to another', {
      event_category: 'Landing Page Click',
    });
    return fetch({
      url: '/folder/' + folder.id + '/add_lists',
      method: 'POST',
      body: { list_ids: [this.props.list.id] },
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.error) {
          this.setState({
            error: response.error,
          });
          return null;
        } else {
          return folder;
        }
      })
      .catch((err) => {
        this.setState({
          error: locationsPage.lists.manageFolderDialog.errorList,
        });
        console.log('Error adding list to folder', err);
      });
  };

  _removeFromFolder = () => {
    gtag('event', 'User removes list from folder', {
      event_category: 'Landing Page Click',
    });
    const folder = this.props.list.folder;

    return fetch({
      url: '/folder/' + folder.id + '/remove_lists',
      method: 'POST',
      body: { list_ids: [this.props.list.id] },
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.error) {
          this.setState({
            error: response.error,
          });
          return null;
        } else {
          return folder;
        }
      })
      .catch((err) => {
        this.setState({
          error: locationsPage.lists.manageFolderDialog.errorRemove,
        });
        console.log('Error removing list from folder', err);
      });
  };
}
