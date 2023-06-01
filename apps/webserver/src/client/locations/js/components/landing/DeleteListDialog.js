import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import MenuItem from 'material-ui/MenuItem';
import * as httpRequest from '../../../../common/js/utils/httpRequest';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
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
      <React.Fragment>
        <Dialog
          open={isOpen}
          modal={false}
          bodyClassName="dialog__body"
          contentClassName="dialog__content"
          onRequestClose={() => onCancel()}
          actions={
            <div className="dialog__footer">
              <Button
                className="dialog__primary-action"
                label={strings.deleteListDialog.confirm}
                variant="primary"
                onClick={() => {
                  gtag('event', 'User Removed List from Landing Page', {
                    ''event_category'': 'Landing Page Click',
                  });
                  this._deleteList(list.id);
                }}
              />
              <LinkButton label={strings.deleteListDialog.cancel} onClick={() => onCancel()} />
            </div>
          }
        >
          <div className="dialog__header">
            <h1 className="dialog__title">{strings.deleteListDialog.title}</h1>
            <IconButton icon={<IconTimes />} onClick={() => onCancel()} size="large" />
          </div>
          <div className="dialog__prompt">
            <span className="DeleteList__dialog-list-name">{list.list_name}</span>
            {strings.deleteListDialog.text}
          </div>
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
      </React.Fragment>
    );
  }

  _deleteList = (list_id) => {
    httpRequest
      .fetchJSON('/locations/lockList', { list_id: list_id })
      .then((response) => {
        httpRequest
          .fetchJSON('/locations/deleteList', { list_id: list_id })
          .then((responseDelete) => {
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
