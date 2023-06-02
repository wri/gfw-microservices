import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';

import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';

import { getIsDiagnosticStatusDraft } from '../../utils/draft.utils';
import IconUsers from '../../../../common/js/components/icon/IconUsers';
import IconMenuDots from '../../../../common/js/components/icon/IconMenuDots';
import {
  locationsPage,
  nav,
  treeCoverLossID,
  userAccessLevel,
  SAVED_LOCATIONS,
} from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import IconButton from '../../../../common/js/components/IconButton';
import IconTimes from '../../../../common/js/components/icon/IconTimes';
import fetch from '../../../../common/js/utils/fetch';
import redirectToPage from '../../../../common/js/utils/redirect';
import {
  addList,
  changeView,
  resetList,
  updateFilteredData,
  updateListData,
  updateListLevelAnalysis,
  updateSelectedLocations,
  updateSpatialData,
} from '../../actions/locationActions';
import LandingDownload from '../lists/download/LandingDownload';
import ManageListFolderDialog from './ManageListFolderDialog';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import store from '../../store';
import {
  classNameForListStatus,
  isDownloadDisabledForThisList,
  isAnalyzingStatus,
  isFailedList,
} from '../../utils/lists.utils';
import DeleteListDialog from './DeleteListDialog';
import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';
import ConfirmDialog from '../lists/download/confirmDialog';
import AnalyzingList from './listItem/AnalyzingList';
import FailedList from './listItem/FailedList';
import sharedColumnText from './listItem/sharedColumnText';
import DraftList from './listItem/DraftList';

export default class LocationList extends Component {
  constructor(props) {
    super(props);
    const { B2BsharedListEnabled } = this.props;

    this.state = {
      isLoadingDiagnostic: false,
      isMenuOpen: false,
      isManageListFolderOpen: false,
      isDeleteDialogOpen: false,
      rerunDialogState: false,
      downloadLargeListFileDialogState: false,
      confirmDownloadDialog: false,
      B2BsharedListEnabled,
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
        list_status_id: locationsPage.listStatus.Pending,
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

  closeMenu = () => {
    this.setState({ isMenuOpen: false });
  };

  redirectToList = (history) => {
    store.dispatch(changeView('lists'));
    history.push('/lists');
  };

  shareList = (e, list) => {
    const { list: listProps, showShareList } = this.props;
    const { B2BsharedListEnabled } = this.state;
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
    const { history } = this.props;
    showShareList(true);

    if (!B2BsharedListEnabled) {
      this.redirectToList(history);
    }

    this.closeMenu();
    this.handleRerunDialogState(e);
  };

  viewDiagnostic = (list) => {
    const { list: listProps } = this.props;
    const { folder } = listProps;

    if (folder) {
      // if the user clicked on the map option from a folder
      gtag('event', 'Folder Click', {
        event_category: 'Landing Page Click',
        event_label: 'User goes to diagnostic for list from folder view',
      });
    } else {
      gtag('event', 'Diagnostic', {
        event_category: 'Landing',
        event_label: 'User opens more menu for list from locations page',
      });
    }
    this.setState({ isLoadingDiagnostic: true });
    fetch({
      url: '/locations/getUserListLocationSpatialData',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: {
        list_ids: [list.id],
        location_id: 0,
      },
    }).then((response) => {
      if (response.errorCode === 604) {
        console.error('list not accessible');
      } else {
        const features = response.features ? response.features : response[0].features;
        const locationIds = features.map((feat) => {
          return feat.properties.location_id;
        });

        store.dispatch(resetList());
        store.dispatch(updateSelectedLocations([]));

        store.dispatch(addList(list));
        store.dispatch(updateSpatialData(features));

        fetch({
          url: '/locations/getLists',
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: { list_ids: [list.id] },
        })
          .then((listData) => {
            const { list_analysis, location_analyses } = listData;
            const locationData = location_analyses[0];
            const analysisData = location_analyses[1];

            const joinedLocAnalyses = [];
            locationData.forEach((loc) => {
              if (analysisData.length > 0) {
                let analysisList = [];

                const { location_id, list_id } = loc;

                analysisList = analysisData.filter(
                  (analysis) => analysis.location_id === location_id && analysis.list_id === list_id
                )[0];

                joinedLocAnalyses.push({ ...loc, ...analysisList });
              } else {
                joinedLocAnalyses.push({ ...loc });
              }
            });

            store.dispatch(updateListData(joinedLocAnalyses));
            store.dispatch(updateSelectedLocations(locationIds));
            store.dispatch(updateFilteredData(locationIds));
            store.dispatch(updateListLevelAnalysis(list_analysis));
            this.setState({ isLoadingDiagnostic: false });
            const { history } = this.props;
            store.dispatch(changeView('diagnostics'));
            history.push('/diagnostics');
          })
          .catch((err) => {
            console.error(err);
            store.dispatch(updateListData([]));
            store.dispatch(updateFilteredData([]));
            this.setState({ isLoadingDiagnostic: false });
          });
      }
    });
  };

  viewMap = (list) => {
    const { list: listProps } = this.props;
    const { folder } = listProps;

    if (folder) {
      // if the user clicked on the map option from a folder
      gtag('event', 'Folder Click', {
        event_category: 'Landing Page Click',
        event_label: 'User goes to map for list from folder view',
      });
    } else {
      gtag('event', 'List item map click', {
        event_category: 'Landing',
        event_label: `user clicked to go to the map for list ${list.list_name}`,
      });
    }

    const sendData = {
      l: [treeCoverLossID],
      i: list.id,
      name: list.list_name,
      gfwListName: false,
      filterCount: 0,
      listView: '',
      numLocations: list.list_locations_count,
      canopyDensity: '',
      filteredLists: '',
      g: false,
      path: 'lists',
      showFullListMap: true,
      totalNumberOfLocationsInList: list.list_locations_count,
    };

    redirectToPage('/map', sendData);
  };

  render() {
    const {
      isMenuOpen,
      menuAnchorEl,
      isLoadingDiagnostic,
      isManageListFolderOpen,
      isDeleteDialogOpen,
      rerunDialogState,
      confirmDownloadDialog,
    } = this.state;
    const { folders, locations, list, currentUser, onFolderChange, isAListSharedWithMe } =
      this.props;
    const strings = locationsPage.lists;

    let listStatusClassName = classNameForListStatus(list.list_status_id);

    const countZeroStatus = locations > 0 ? '' : classNameForListStatus(1);

    const userIsAdmin = currentUser.access_level_id === userAccessLevel.ADMIN;
    const userIsViewer = currentUser.access_level_id === userAccessLevel.VIEWER;
    const userIsOwner = currentUser.id === list.user_id;
    const isSavedLocation = SAVED_LOCATIONS.indexOf(list.list_name) !== -1;
    const isShared = list.is_shared;
    const isInFolder = !!list.folder;
    const isLargeList = !!list.large_list_id;
    const hasErrorFile = !!list.error_file_storage_path;

    const showDelete = (userIsAdmin || (!userIsViewer && userIsOwner)) && !isSavedLocation;
    const showRerun = (userIsAdmin || (!userIsViewer && userIsOwner)) && !isSavedLocation;
    // List context menu flags
    const showDiagnosticOpt = !isShared && locations > 0;
    const showMapOpt = !isShared && locations > 0;
    const showDownloadOpt =
      !isDownloadDisabledForThisList(list) &&
      (userIsAdmin || (!userIsViewer && userIsOwner)) &&
      (locations > 0 || hasErrorFile);

    const showRerunOpt = (userIsAdmin || (!userIsViewer && userIsOwner)) && locations > 0;
    const showNonOwnerDraft = !userIsAdmin && isShared;

    const IS_LOCK_STATUS = !!(list.lock_status && list.lock_user_id);
    const IS_EMPTY_LIST = locations === 0;

    if (IS_LOCK_STATUS) {
      listStatusClassName = 'locations-list--inactive';
    }

    const showSharedColumn = list.sharedWith || list.sharedList;

    const clickLocationRow = () => {
      if (IS_LOCK_STATUS || IS_EMPTY_LIST) {
        return;
      }
      const { list_status_id, list_name, id, is_shared } = list;

      if (list_status_id === locationsPage.listStatus.Active) {
        // clicked a location with a successfully completed analysis; go to it
        gtag('event', 'List click', {
          event_category: 'Landing',
          event_label: `user clicked on list ${list_name}`,
        });
      }
      window.location = `/locations?id=${id}${is_shared ? '&shared=true' : ''}`;
    };

    const listStatusComponent = (list) => {
      if (isAnalyzingStatus(list.list_status_id)) {
        return (
          <AnalyzingList
            listName={list.list_name}
            showListSharedWithMeIcon={isAListSharedWithMe}
            isSharedList={isShared}
            showSharedColumn={showSharedColumn}
          />
        );
      } else if (isFailedList(list)) {
        return (
          <FailedList
            listName={list.list_name}
            showListSharedWithMeIcon={isAListSharedWithMe}
            isSharedList={isShared}
            showSharedColumn={showSharedColumn}
            hasLockStatus={IS_LOCK_STATUS}
            showRerun={showRerun}
            isLargeList={isLargeList}
            handleRerunDialogState={this.handleRerunDialogState}
            isInFolder={isInFolder}
            showDelete={showDelete}
            setManageListFolderOpen={() => this.setState({ isManageListFolderOpen: true })}
            setDeleteDialogOpen={() => this.setState({ isDeleteDialogOpen: true })}
          />
        );
      } else if (getIsDiagnosticStatusDraft(list)) {
        return (
          <DraftList
            list={list}
            locations={locations}
            isLargeList={isLargeList}
            isEmptyList={IS_EMPTY_LIST}
            showListSharedWithMeIcon={isAListSharedWithMe}
            showSharedColumn={showSharedColumn}
            showNonOwnerDraft={showNonOwnerDraft}
            showDelete={showDelete}
            showRerunOpt={showRerunOpt}
            hasLockStatus={IS_LOCK_STATUS}
            showMapOpt={showMapOpt}
            showDownloadOpt={showDownloadOpt}
            setManageListFolderOpen={() => this.setState({ isManageListFolderOpen: true })}
            showConfirmDownloadDialog={() => this.setState({ confirmDownloadDialog: true })}
            shareList={(e, list) => this.shareList(e, list)}
            setDeleteDialogOpen={() => this.setState({ isDeleteDialogOpen: true })}
            isInFolder={isInFolder}
            hasErrorFile={hasErrorFile}
            userIsAdmin={userIsAdmin}
          />
        );
      } else {
        return (
          <li
            className={`locations-list ${listStatusClassName} ${countZeroStatus}`}
            onClick={clickLocationRow}
          >
            <div className="locations-list__title">
              {isAListSharedWithMe && <PublicIcon />}
              {list.list_name}
              {isShared && <IconUsers className="locations-list__shared-icon" />}
            </div>
            {showSharedColumn && (
              <div className="locations-list__shared">
                <GroupsIcon />
                {sharedColumnText()}
              </div>
            )}

            <div className="locations-list__controls">
              {showRerun && !IS_LOCK_STATUS && (
                <Button
                  className="locations-list__update-button"
                  onClick={this.handleRerunDialogState}
                  label={strings.update}
                  size="small"
                  variant="secondary"
                />
              )}

              {!IS_LOCK_STATUS && (
                <span className="locations-list__count">
                  {numberWithCommas(locations || 0)} {strings.locations.toLowerCase()}
                </span>
              )}

              {IS_LOCK_STATUS && (
                <span className="locations-list__analyzing">
                  <InlineLoader />
                  Working...
                </span>
              )}
            </div>

            <div className="locations-list__menu-container">
              <IconButton
                icon={<IconMenuDots />}
                title={nav.more}
                size="medium"
                variant="menu"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setState({
                    menuAnchorEl: e.currentTarget,
                    isMenuOpen: !isMenuOpen,
                  });
                }}
              />
              <Popover
                anchorEl={menuAnchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={isMenuOpen}
                onRequestClose={this.closeMenu}
                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Menu className="context-menu">
                  {showDiagnosticOpt && (
                    <MenuItem
                      primaryText={strings.diagnostic}
                      leftIcon={isLoadingDiagnostic ? <InlineLoader /> : null}
                      onClick={() => {
                        this.viewDiagnostic(list);
                      }}
                    />
                  )}
                  {showMapOpt && (
                    <MenuItem primaryText={strings.map} onClick={() => this.viewMap(list)} />
                  )}
                  {showDownloadOpt && (
                    <LandingDownload
                      locations={locations || 0}
                      listID={list.id}
                      isLargeList={isLargeList}
                      hasErrorFile={hasErrorFile}
                      downloadRequestedFromFolder={!!list.folder}
                      closeMenu={() => this.closeMenu()}
                      setConfirmDialog={(value) => this.setState({ confirmDownloadDialog: value })}
                      error_file_storage_path={list.error_file_storage_path}
                    />
                  )}
                  {userIsAdmin && (
                    <MenuItem
                      primaryText={strings.share}
                      onClick={(e) => this.shareList(e, list)}
                    />
                  )}
                  {showRerunOpt && (
                    <MenuItem
                      primaryText={strings.update}
                      onClick={(e) => {
                        this.closeMenu();
                        this.handleRerunDialogState(e);
                      }}
                    />
                  )}

                  <Divider />
                  <MenuItem
                    primaryText={isInFolder ? strings.manage : strings.addToFolder}
                    onClick={() => {
                      this.setState({ isManageListFolderOpen: true });
                      this.closeMenu();
                    }}
                  />
                  {showDelete && (
                    <>
                      <Divider />
                      <MenuItem
                        primaryText={strings.delete}
                        className="MenuItem--danger"
                        onClick={() => {
                          this.setState({ isDeleteDialogOpen: true });
                          this.closeMenu();
                        }}
                      />
                    </>
                  )}
                </Menu>
              </Popover>
            </div>
          </li>
        );
      }
    };

    return (
      <>
        {listStatusComponent(list)}
        {/* This must be outside the menu, otherwise it will not be rendered while the menu is closed */}
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
          /* This must be outside the menu, otherwise it will not be rendered while the menu is closed */
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
                  label={strings.ok}
                  onClick={this.rerunList}
                  variant="primary"
                />
                <LinkButton label={strings.cancel} onClick={this.handleRerunDialogState} />
              </div>
            }
            modal={false}
            open={rerunDialogState}
            onRequestClose={this.handleRerunDialogState}
            bodyClassName="dialog__body"
            contentClassName="dialog__content"
          >
            <div className="dialog__header">
              <h1 className="dialog__title">{strings.rerunListDialog.title}</h1>
              <IconButton icon={<IconTimes />} onClick={this.handleRerunDialogState} size="large" />
            </div>
            <div className="dialog__prompt">{strings.rerunListDialog.text}</div>
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
