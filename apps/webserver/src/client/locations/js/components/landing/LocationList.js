/* eslint-disable react/no-children-prop */
/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-filename-extension */
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
import CustomTooltip from '../../../../common/js/components/CustomTooltip/CustomTooltip';
import FailedTooltip from '../../../../common/js/components/CustomTooltip/FailedTooltip';
import IconMenuDots from '../../../../common/js/components/icon/IconMenuDots';
import CustomDraftDialog from '../../../../common/js/components/CustomDraftDialog/CustomDraftDialog';
import {
  draftTooltipMessages,
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
import { requestGeoTrellisAnalyzeList } from '../../utils/request.utils';
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
import ListDiagnosticStatusDraft from './components/ListDiagnosticStatusDraft/ListDiagnosticStatusDraft';
import DownloadLargeListFile from './DownloadLargeListFile';
import ConfirmDialog from '../lists/download/confirmDialog';

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
      showSubmitModal: false,
      downloadLargeListFileDialogState: false,
      confirmDialogState: false,
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

    ga(
      'send',
      'event',
      'Landing',
      'update button click',
      'user clicked on the ok button in the modal window to confirm updating the list'
    );
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
      ga(
        'send',
        'event',
        'Landing Page Click',
        'Folder Click',
        'User shares list from folder view'
      );
    } else {
      ga('send', 'event', 'Landing', 'User opens more menu for list from locations page', 'Share');
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
      ga(
        'send',
        'event',
        'Landing Page Click',
        'Folder Click',
        'User goes to diagnostic for list from folder view'
      );
    } else {
      ga(
        'send',
        'event',
        'Landing',
        'User opens more menu for list from locations page',
        'Diagnostic'
      );
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
      ga(
        'send',
        'event',
        'Landing Page Click',
        'Folder Click',
        'User goes to map for list from folder view'
      );
    } else {
      ga(
        'send',
        'event',
        'Landing',
        'List item map click',
        `user clicked to go to the map for list ${list.list_name}`
      );
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
      showSubmitModal,
      isManageListFolderOpen,
      isDeleteDialogOpen,
      rerunDialogState,
      downloadLargeListFileDialogState,
      confirmDialogState,
    } = this.state;
    const {
      folders,
      locations,
      list,
      currentUser,
      isDiagnosticStatusDraft,
      onFolderChange,
      showIcon,
    } = this.props;
    const strings = locationsPage.lists;

    let listStatusClassName = classNameForListStatus(list.list_status_id);

    const countZeroStatus = locations > 0 ? '' : classNameForListStatus(1);

    const userIsAdmin = currentUser.access_level_id === userAccessLevel.ADMIN;
    const userIsViewer = currentUser.access_level_id === userAccessLevel.VIEWER;
    const userIsOwner = currentUser.id === list.user_id;
    const isPending = [
      locationsPage.listStatus.Pending,
      locationsPage.listStatus.AnalyzingDiagnostic,
      locationsPage.listStatus.AnalyzingDashboard,
    ].includes(list.list_status_id);
    const isFailed = isFailedList(list);
    const isSavedLocation = SAVED_LOCATIONS.indexOf(list.list_name) !== -1;
    const isShared = list.is_shared;
    const isInFolder = !!list.folder;
    const isInDraft = getIsDiagnosticStatusDraft(list);
    const isLargeList = !!list.large_list_id;
    const hasErrorFile = !!list.error_file_storage_path;

    const showDelete =
      (userIsAdmin || (!userIsViewer && userIsOwner)) && !isPending && !isSavedLocation;
    const showRerun =
      (userIsAdmin || (!userIsViewer && userIsOwner)) && !isPending && !isSavedLocation;
    // List context menu flags
    const showDiagnosticOpt = !isPending && !isFailed && !isShared && !isInDraft && locations > 0;
    const showMapOpt = !isPending && !isFailed && !isShared && locations > 0;
    const showDownloadOpt =
      !isDownloadDisabledForThisList(list) &&
      !isPending &&
      !isFailed &&
      (userIsAdmin || (!userIsViewer && userIsOwner)) &&
      (locations > 0 || hasErrorFile);

    const showShareOpt = userIsAdmin && !isPending && !isFailed;
    const showRerunOpt = (userIsAdmin || (!userIsViewer && userIsOwner)) && locations > 0;
    const showNonOwnerDraft = !userIsAdmin && isShared && isInDraft;

    const TOOLTIP__LABEL = 'DRAFT';
    const TOOLTIP__MESSAGE_NON_OWNER = draftTooltipMessages.nonOwner;
    const IS_ANALYZING_STATUS = isAnalyzingStatus(list.list_status_id);
    const IS_LOCK_STATUS = !!(list.lock_status && list.lock_user_id);
    const IS_EMPTY_LIST = locations === 0;

    if (IS_LOCK_STATUS) {
      listStatusClassName = 'locations-list--inactive';
    }

    const showShareCollumn = list.sharedWith || list.sharedList;

    const clickLocationRow = () => {
      if (isFailed || IS_ANALYZING_STATUS || IS_LOCK_STATUS || IS_EMPTY_LIST) {
        return;
      }
      const { list_status_id, list_name, id, is_shared } = list;

      if (list_status_id === locationsPage.listStatus.Active) {
        // clicked a location with a successfully completed analysis; go to it
        ga('send', 'event', 'Landing', 'List click', `user clicked on list ${list_name}`);
      } else if (list_status_id === locationsPage.listStatus.Draft) {
        // clicked a Draft list; go to it
        ga('send', 'event', 'Landing', 'List click', `user clicked on Draft list ${list_name}`);
      }
      window.location = `/locations?id=${id}${is_shared ? '&shared=true' : ''}`;
    };

    const sharedCollumnText = () => {
      if (list.sharedWith) {
        return list.sharedWith;
      }

      return list.sharedList.length > 1
        ? `${list.sharedList[0]}, ${list.sharedList.length - 1}+`
        : list.sharedList[0];
    };
    return (
      <li
        className={`locations-list ${listStatusClassName} ${countZeroStatus}`}
        onClick={clickLocationRow}
        title={isPending ? locationsPage.landing.pendingMessage : ''}
      >
        <div className="locations-list__title">
          {showIcon && <PublicIcon />}
          {list.list_name}
          {isShared && <IconUsers className="locations-list__shared-icon" />}
        </div>
        {showShareCollumn && (
          <div className="locations-list__shared">
            <GroupsIcon />
            {sharedCollumnText()}
          </div>
        )}

        <div className="locations-list__controls">
          {isDiagnosticStatusDraft && showRerunOpt && !IS_LOCK_STATUS && (
            <ListDiagnosticStatusDraft list={list} />
          )}
          {showNonOwnerDraft && !IS_LOCK_STATUS && (
            <span className="DiagnosticStatusDraft__label">
              <CustomTooltip
                placement="top"
                label={TOOLTIP__LABEL}
                tooltipMessage={TOOLTIP__MESSAGE_NON_OWNER}
                iconWidth={13}
                iconHeight={16}
              />
            </span>
          )}

          {!isDiagnosticStatusDraft && showRerun && !IS_LOCK_STATUS && (
            <Button
              className="locations-list__update-button"
              onClick={this.handleRerunDialogState}
              label={strings.update}
              size="small"
              variant="secondary"
            />
          )}

          {isFailed && !isPending && !IS_LOCK_STATUS && (
            <span className="locations-list__failed">
              <FailedTooltip
                placement="top"
                label={strings.failed}
                tooltipMessage={`This list has failed analysis. To receive results, resubmit this list for analysis. ${
                  isLargeList ? 'Click to download the file and fix errors.' : ''
                }`}
                onClickAction={
                  isLargeList
                    ? () => {
                        this.setState({ downloadLargeListFileDialogState: true });
                      }
                    : undefined
                }
              />
            </span>
          )}

          {isPending && !isFailed && !IS_LOCK_STATUS && (
            <span className="locations-list__analyzing">
              <InlineLoader />
              {strings.analyzing}
            </span>
          )}

          {!isPending && !isFailed && !IS_LOCK_STATUS && (
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
            title={isPending ? '' : nav.more}
            disabled={isPending}
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
                  hideDownload={() => this.closeMenu()}
                  setConfirmDialog={(value) => this.setState({ confirmDialogState: value })}
                  error_file_storage_path={list.error_file_storage_path}
                />
              )}
              {showShareOpt && (
                <MenuItem primaryText={strings.share} onClick={(e) => this.shareList(e, list)} />
              )}
              {showRerunOpt && !isInDraft && (
                <MenuItem
                  primaryText={strings.update}
                  onClick={(e) => {
                    this.closeMenu();
                    this.handleRerunDialogState(e);
                  }}
                />
              )}
              {showRerunOpt && isInDraft && (
                <MenuItem
                  primaryText="Submit"
                  onClick={() => {
                    this.closeMenu();
                    this.setState({ showSubmitModal: true });
                  }}
                />
              )}
              {(showDiagnosticOpt ||
                showMapOpt ||
                showDownloadOpt ||
                showShareOpt ||
                showRerunOpt) && <Divider />}
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
          {showSubmitModal && (
            <CustomDraftDialog
              open
              closeAction={() => {
                this.setState({ showSubmitModal: false });
              }}
              dialogTitle="Confirm Submission"
              dialogMessage="Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete."
              dialogActionConfirm={() => {
                requestGeoTrellisAnalyzeList(list)
                  .then((response) => {
                    ga(
                      'send',
                      'event',
                      'Submit',
                      'Submit List',
                      'User submits a list for analysis'
                    );
                    ga(
                      'send',
                      'event',
                      'Submit',
                      'Submit List',
                      'User submits a list from landing page'
                    );
                    // TODO: Get details what to do after list is submitted
                    console.log(response.data);
                    window.location.reload();
                  })
                  .catch((error) => {
                    // TODO: Get details what to do after list submission fails
                    console.log(error);
                  })
                  .finally(() => {
                    this.setState({ showSubmitModal: false });
                  });
              }}
            />
          )}
          {/* This must be outside the menu, otherwise it will not be rendered while the menu is closed */}
          <ManageListFolderDialog
            isOpen={isManageListFolderOpen}
            folders={folders}
            list={list}
            onCancel={() => this.setState({ isManageListFolderOpen: false })}
            onComplete={(msg) => {
              ga(
                'send',
                'event',
                'Landing',
                'User opens more menu for list from locations page',
                'Add to folder'
              );
              this.setState({ isManageListFolderOpen: false });
              onFolderChange(msg);
            }}
          />
          {showDelete && (
            /* This must be outside the menu, otherwise it will not be rendered while the menu is closed */
            <DeleteListDialog
              isOpen={isDeleteDialogOpen}
              list={list}
              onCancel={() => this.setState({ isDeleteDialogOpen: false })}
              onComplete={() => {
                ga(
                  'send',
                  'event',
                  'Landing',
                  'User opens more menu for list from locations page',
                  'Delete'
                );
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
                <IconButton
                  icon={<IconTimes />}
                  onClick={this.handleRerunDialogState}
                  size="large"
                />
              </div>
              <div className="dialog__prompt">{strings.rerunListDialog.text}</div>
            </Dialog>
          )}

          <Dialog
            modal
            open={downloadLargeListFileDialogState}
            autoDetectWindowHeight={false}
            autoScrollBodyContent={false}
            contentStyle={{ width: '80%', maxWidth: 'none' }}
            children={
              <DownloadLargeListFile
                onCancel={() => this.setState({ downloadLargeListFileDialogState: false })}
              />
            }
          />
          <ConfirmDialog
            open={confirmDialogState}
            setDialogOpen={(value) =>
              this.setState({
                confirmDialogState: value,
              })
            }
          />
        </div>
      </li>
    );
  }
}
