import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import { getIsDiagnosticStatusDraft } from '../../../../listDetails/js/utils/draft.utils';
import { locationsPage, userAccessLevel, SAVED_LOCATIONS } from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import fetch from '../../../../common/js/utils/fetch';
import { addList, changeView, resetList } from '../../actions/locationActions';
import ManageListFolderDialog from './ManageListFolderDialog';
import store from '../../store';
import {
  isDownloadDisabledForThisList,
  isAnalyzingStatus,
  isFailedList,
  isListFailedByAnalysisStatusLimit,
} from '../../utils/lists.utils';
import DeleteListDialog from './DeleteListDialog';
import ConfirmDialog from '../lists/download/confirmDialog';
import AnalyzingList from './listItem/AnalyzingList';
import FailedList from './listItem/FailedList';
import DraftList from './listItem/DraftList';
import ActiveList from './listItem/ActiveList';
import { listStatus } from '../../../../../config/env/listStatuses.constants';

export default class LocationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isManageListFolderOpen: false,
      isDeleteDialogOpen: false,
      rerunDialogState: false,
      downloadLargeListFileDialogState: false,
      confirmDownloadDialog: false,
    };
  }

  rerunList = () => {
    const { list, showLoader } = this.props;
    const {
      list_analysis_table_name,
      list_name,
      list_table_name,
      template_id,
      list_locations_count,
      id: list_id,
    } = list;

    showLoader(true);

    fetch({
      url: '/locations/rerunExistingList',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: {
        list_analysis_table_name,
        list_name,
        list_table_name,
        template_id,
        list_id,
        list_locations_count,
        list_status_id: listStatus.Pending,
        reanalyze: true,
      },
    })
      .then(() => {
        this.handleRerunDialogState();
        showLoader(false);
      })
      .catch((err) => {
        showLoader(false);
        console.log('Error when re-running a list', err);
      });

    gtag('event', 'update button click', {
      event_category: 'Landing',
      event_label: 'user clicked on the ok button in the modal window to confirm updating the list',
    });
  };

  handleRerunDialogState = (e) => {
    const { rerunDialogState } = this.state;

    if (e) {
      e.stopPropagation();
    }
    this.setState({ rerunDialogState: !rerunDialogState });
  };

  redirectToList = (history) => {
    store.dispatch(changeView('lists'));
    history.push('/lists');
  };

  shareList = (e, list) => {
    const { list: listProps, showShareList } = this.props;
    const { folder } = listProps;
    if (folder) {
      // if the user clicked on the map option from a folder
      gtag('event', 'Folder Click', {
        event_category: 'Landing Page Click',
        event_label: 'User shares list from folder view',
      });
    } else {
      gtag('event', 'User opens more menu for list from locations page', {
        event_category: 'Landing',
        event_label: 'Share',
      });
    }

    store.dispatch(resetList());
    store.dispatch(addList(list));
    showShareList(true);
  };

  render() {
    const { isManageListFolderOpen, isDeleteDialogOpen, rerunDialogState, confirmDownloadDialog } =
      this.state;
    const {
      B2BsharedListEnabled,
      folders,
      locations,
      list,
      currentUser,
      onFolderChange,
      isAListSharedWithMe,
      history,
    } = this.props;

    const userIsAdmin = currentUser.access_level_id === userAccessLevel.ADMIN;
    const userIsViewer = currentUser.access_level_id === userAccessLevel.VIEWER;
    const userIsOwner = currentUser.id === list.user_id;
    const isSavedLocation = SAVED_LOCATIONS.indexOf(list.list_name) !== -1;
    const isShared = list.is_shared;
    const hasErrorFile = !!list.error_file_storage_path;

    const showDelete = (userIsAdmin || (!userIsViewer && userIsOwner)) && !isSavedLocation;
    const showRerun = (userIsAdmin || (!userIsViewer && userIsOwner)) && !isSavedLocation;

    // List context menu flags
    const showMapOpt = !isShared && locations > 0;
    const showDownloadOpt =
      !isDownloadDisabledForThisList(list) &&
      (userIsAdmin || (!userIsViewer && userIsOwner)) &&
      (locations > 0 || hasErrorFile);

    const showRerunOpt = (userIsAdmin || (!userIsViewer && userIsOwner)) && locations > 0;
    const showNonOwnerDraft = !userIsAdmin && isShared;

    // list is in lock status, copying or moving locations
    const hasLockStatus = !!list.lock_status && !!list.lock_user_id;

    const showSharedColumn = list.sharedWith || list.sharedList;

    const listStatusComponent = (list) => {
      if (isAnalyzingStatus(list.list_status_id) || hasLockStatus) {
        return (
          <AnalyzingList
            list={list}
            showListSharedWithMeIcon={isAListSharedWithMe}
            showSharedColumn={showSharedColumn}
          />
        );
      } else if (isFailedList(list)) {
        return (
          <FailedList
            list={list}
            showListSharedWithMeIcon={isAListSharedWithMe}
            showSharedColumn={showSharedColumn}
            showRerun={showRerun}
            handleRerunDialogState={this.handleRerunDialogState}
            showDelete={showDelete}
            setManageListFolderOpen={() => this.setState({ isManageListFolderOpen: true })}
            setDeleteDialogOpen={() => this.setState({ isDeleteDialogOpen: true })}
            isFailedByUsageLimits={isListFailedByAnalysisStatusLimit(list)}
          />
        );
      } else if (getIsDiagnosticStatusDraft(list)) {
        return (
          <DraftList
            list={list}
            locations={locations}
            showListSharedWithMeIcon={isAListSharedWithMe}
            showSharedColumn={showSharedColumn}
            showNonOwnerDraft={showNonOwnerDraft}
            showDelete={showDelete}
            showRerunOpt={showRerunOpt}
            showMapOpt={showMapOpt}
            showDownloadOpt={showDownloadOpt}
            setManageListFolderOpen={() => this.setState({ isManageListFolderOpen: true })}
            showConfirmDownloadDialog={() => this.setState({ confirmDownloadDialog: true })}
            shareList={(e, list) => this.shareList(e, list)}
            setDeleteDialogOpen={() => this.setState({ isDeleteDialogOpen: true })}
            userIsAdmin={userIsAdmin}
            B2BsharedListEnabled={B2BsharedListEnabled}
          />
        );
      } else {
        return (
          <ActiveList
            list={list}
            locations={locations}
            showListSharedWithMeIcon={isAListSharedWithMe}
            showSharedColumn={showSharedColumn}
            showDelete={showDelete}
            showRerun={showRerun}
            showRerunOpt={showRerunOpt}
            showMapOpt={showMapOpt}
            showDownloadOpt={showDownloadOpt}
            setManageListFolderOpen={() => this.setState({ isManageListFolderOpen: true })}
            showConfirmDownloadDialog={() => this.setState({ confirmDownloadDialog: true })}
            shareList={(e, list) => this.shareList(e, list)}
            setDeleteDialogOpen={() => this.setState({ isDeleteDialogOpen: true })}
            userIsAdmin={userIsAdmin}
            handleRerunDialogState={this.handleRerunDialogState}
            history={history}
          />
        );
      }
    };

    return (
      <>
        {listStatusComponent(list)}
        <ManageListFolderDialog
          isOpen={isManageListFolderOpen}
          folders={folders}
          list={list}
          onCancel={() => this.setState({ isManageListFolderOpen: false })}
          onComplete={(msg) => {
            gtag('event', 'User opens more menu for list from locations page', {
              event_category: 'Landing',
              event_label: 'Add to folder',
            });
            this.setState({ isManageListFolderOpen: false });
            onFolderChange(msg);
          }}
        />
        {isDeleteDialogOpen && (
          <DeleteListDialog
            isOpen={isDeleteDialogOpen}
            list={list}
            onCancel={() => this.setState({ isDeleteDialogOpen: false })}
            onComplete={() => {
              gtag('event', 'User opens more menu for list from locations page', {
                event_category: 'Landing',
                event_label: 'Delete',
              });
              this.setState({ isDeleteDialogOpen: false });
            }}
          />
        )}
        {rerunDialogState && (
          <Dialog
            actions={
              <div className="dialog__footer">
                <Button
                  className="dialog__primary-action"
                  label={locationsPage.lists.ok}
                  onClick={this.rerunList}
                  variant="primary"
                />
                <LinkButton
                  label={locationsPage.lists.cancel}
                  onClick={this.handleRerunDialogState}
                />
              </div>
            }
            modal={false}
            open={rerunDialogState}
            onRequestClose={this.handleRerunDialogState}
            bodyClassName="dialog__body"
            contentClassName="dialog__content"
          >
            <div className="dialog__header">
              <h1 className="dialog__title">{locationsPage.lists.rerunListDialog.title}</h1>
              <IconButton icon={<IconTimes />} onClick={this.handleRerunDialogState} size="large" />
            </div>
            <div className="dialog__prompt">{locationsPage.lists.rerunListDialog.text}</div>
          </Dialog>
        )}
        {showDownloadOpt && (
          <ConfirmDialog
            open={confirmDownloadDialog}
            setDialogOpen={(value) =>
              this.setState({
                confirmDownloadDialog: value,
              })
            }
          />
        )}
      </>
    );
  }
}
