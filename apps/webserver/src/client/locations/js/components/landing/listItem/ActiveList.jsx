import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Popover from 'material-ui/Popover';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PlaceIcon from '@mui/icons-material/Place';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from 'material-ui/Divider';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Button from '../../../../../common/js/components/Button';
import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import sharedColumnText from './sharedColumnText';
import redirectToPage from '../../../../../common/js/utils/redirect';
import LandingDownload from '../../lists/download/LandingDownload';
import { numberWithCommas } from '../../../utils/locationsTableUtils';
import ChangeTypeOfAnalysisModal from './ChangeTypeOfAnalysisModal';
import AnalysisListChips from './AnalysisListChips';
import { locationsPage, nav, treeCoverLossID } from '../../../../../common/js/config';
import featureFlags from '../../../../../../utils/general.utils';
import getActiveAnalysisType from '../../../../../../utils/getActiveAnalysisType';

function ActiveList({
  list,
  locations,
  showListSharedWithMeIcon,
  showSharedColumn,
  showDelete,
  showRerun,
  showRerunOpt,
  showMapOpt,
  showDownloadOpt,
  setManageListFolderOpen,
  showConfirmDownloadDialog,
  shareList,
  setDeleteDialogOpen,
  userIsAdmin,
  handleRerunDialogState,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangeTypeOfAnalysisModalOpen, setIsChangeTypeOfAnalysisModalOpen] = useState(false);

  const { isAfiAvailable } = featureFlags;

  const {
    list_name,
    id,
    is_shared,
    folder,
    list_locations_count,
    error_file_storage_path,
    large_list_id,
    listAnalysesStatus,
  } = list;

  const isLargeList = !!large_list_id;
  const hasErrorFile = !!error_file_storage_path;
  const isEmptyList = locations === 0;
  const showDiagnosticOpt = !is_shared && !isEmptyList && getActiveAnalysisType(listAnalysesStatus);

  const clickLocationRow = () => {
    if (isEmptyList) {
      return;
    }
    // clicked a location with a successfully completed analysis; go to it
    gtag('event', 'List click', {
      event_category: 'Landing',
      event_label: `user clicked on list ${list_name}`,
    });

    window.location = `/locations?id=${id}${is_shared ? '&shared=true' : ''}`;
  };

  const viewMap = () => {
    if (folder) {
      // if the user clicked on the map option from a folder
      gtag('event', 'Folder Click', {
        event_category: 'Landing Page Click',
        event_label: 'User goes to map for list from folder view',
      });
    } else {
      gtag('event', 'List item map click', {
        event_category: 'Landing',
        event_label: `user clicked to go to the map for list ${list_name}`,
      });
    }

    const sendData = {
      l: [treeCoverLossID],
      i: id,
      name: list_name,
      gfwListName: false,
      filterCount: 0,
      listView: '',
      numLocations: list_locations_count,
      canopyDensity: '',
      filteredLists: '',
      g: false,
      path: 'lists',
      showFullListMap: true,
      totalNumberOfLocationsInList: list_locations_count,
    };

    redirectToPage('/map', sendData);
  };

  return (
    <>
      {isAfiAvailable && (
        <ChangeTypeOfAnalysisModal
          listId={id}
          listName={list_name}
          listAnalysesStatus={listAnalysesStatus}
          setIsChangeTypeOfAnalysisModalOpen={setIsChangeTypeOfAnalysisModalOpen}
          isChangeTypeOfAnalysisModalOpen={isChangeTypeOfAnalysisModalOpen}
        />
      )}
      <li
        className={`locations-list ${isEmptyList ? 'locations-list--inactive' : ''}`}
        onClick={clickLocationRow}
      >
        <div className="locations-list__title">
          {showListSharedWithMeIcon && <PublicIcon />}
          {list_name}
          {is_shared && <IconUsers className="locations-list__shared-icon" />}
          <Chip
            label={numberWithCommas(locations || 0)}
            size="small"
            style={{ height: '17px', marginLeft: '10px' }}
          />
        </div>

        {showSharedColumn && (
          <div className="locations-list__shared">
            <GroupsIcon />
            {sharedColumnText()}
          </div>
        )}

        <div className="locations-list__controls">
          <AnalysisListChips listAnalysesStatus={listAnalysesStatus} />

          {showRerun && (
            <Button
              className="locations-list__update-button"
              onClick={handleRerunDialogState}
              label={locationsPage.lists.update}
              size="small"
              variant="secondary"
            />
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
              setMenuAnchorEl(e.currentTarget);
              setIsMenuOpen(!isMenuOpen);
            }}
          />
          <Popover
            anchorEl={menuAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            open={isMenuOpen}
            onRequestClose={() => setIsMenuOpen(false)}
            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Menu className="context-menu">
              {showDiagnosticOpt && (
                <MenuItem
                  primaryText={locationsPage.lists.diagnostic}
                  leftIcon={<QueryStatsIcon />}
                  onClick={() => {
                    const diagnosticsType = getActiveAnalysisType(listAnalysesStatus);
                    window.location = `/diagnostics?listId=${id}&type=${diagnosticsType}`;
                  }}
                />
              )}
              {showMapOpt && (
                <MenuItem
                  primaryText={locationsPage.lists.map}
                  leftIcon={<PlaceIcon />}
                  onClick={viewMap}
                />
              )}
              {showDownloadOpt && (
                <LandingDownload
                  locations={locations || 0}
                  listID={id}
                  isLargeList={isLargeList}
                  hasErrorFile={hasErrorFile}
                  downloadRequestedFromFolder={!!folder}
                  closeMenu={() => setIsMenuOpen(false)}
                  setConfirmDialog={() => showConfirmDownloadDialog()}
                  error_file_storage_path={error_file_storage_path}
                />
              )}
              {userIsAdmin && (
                <MenuItem
                  primaryText={locationsPage.lists.share}
                  leftIcon={<ShareIcon />}
                  onClick={(e) => shareList(e, list)}
                />
              )}
              {showRerunOpt && (
                <MenuItem
                  primaryText={locationsPage.lists.update}
                  leftIcon={<RefreshIcon />}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleRerunDialogState(e);
                  }}
                />
              )}

              <Divider />
              <MenuItem
                primaryText={
                  !!folder ? locationsPage.lists.manage : locationsPage.lists.addToFolder
                }
                leftIcon={<FolderIcon />}
                onClick={() => {
                  setManageListFolderOpen();
                  setIsMenuOpen(false);
                }}
              />
              {isAfiAvailable && (
                <MenuItem
                  primaryText={locationsPage.lists.changeTypeOfAnalysis}
                  leftIcon={<SettingsIcon />}
                  onClick={() => {
                    setIsChangeTypeOfAnalysisModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                />
              )}
              {showDelete && (
                <>
                  <Divider />
                  <MenuItem
                    primaryText={locationsPage.lists.delete}
                    leftIcon={<DeleteIcon />}
                    className="MenuItem--danger"
                    onClick={() => {
                      setDeleteDialogOpen();
                      setIsMenuOpen(false);
                    }}
                  />
                </>
              )}
            </Menu>
          </Popover>
        </div>
      </li>
    </>
  );
}

export default ActiveList;
