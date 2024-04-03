import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import Popover from 'material-ui/Popover';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import PlaceIcon from '@mui/icons-material/Place';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ShareIcon from '@mui/icons-material/Share';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from 'material-ui/Divider';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import ListDiagnosticStatusDraft from '../components/ListDiagnosticStatusDraft/ListDiagnosticStatusDraft';
import CustomTooltip from '../../../../../common/js/components/CustomTooltip/CustomTooltip';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import sharedColumnText from './sharedColumnText';
import redirectToPage from '../../../../../common/js/utils/redirect';
import LandingDownload from '../../lists/download/LandingDownload';
import { numberWithCommas } from '../../../utils/locationsTableUtils';
import featureFlags from '../../../../../../utils/general.utils';
import ChangeTypeOfAnalysisModal from './ChangeTypeOfAnalysisModal';
import AnalysisListChips from './AnalysisListChips';
import CustomDraftDialog from '../../../../../common/js/components/CustomDraftDialog/CustomDraftDialog';
import {
  locationsPage,
  draftTooltipMessages,
  nav,
  treeCoverLossID,
} from '../../../../../common/js/config';

function DraftList({
  list,
  locations,
  showListSharedWithMeIcon,
  showNonOwnerDraft,
  showDelete,
  showRerunOpt,
  showSharedColumn,
  showMapOpt,
  showDownloadOpt,
  showConfirmDownloadDialog,
  shareList,
  setDeleteDialogOpen,
  userIsAdmin,
  submitForAnalysis,
  setManageListFolderOpen,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
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
  const isInFolder = !!folder;
  const isEmptyList = locations === 0;

  const clickLocationRow = () => {
    if (isEmptyList) {
      return;
    }

    gtag('event', 'List click', {
      event_category: 'Landing',
      event_label: `user clicked on Draft list ${list_name}`,
    });

    window.location = `/list-details?id=${id}${is_shared ? '&shared=true' : ''}`;
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
        title={locationsPage.landing.pendingMessage}
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

          {showRerunOpt && <ListDiagnosticStatusDraft submitForAnalysis={submitForAnalysis} />}
          {showNonOwnerDraft && (
            <span className="DiagnosticStatusDraft__label">
              <CustomTooltip
                placement="top"
                label={'DRAFT'}
                tooltipMessage={draftTooltipMessages.nonOwner}
                iconWidth={13}
                iconHeight={16}
              />
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
              {showMapOpt && (
                <MenuItem
                  leftIcon={<PlaceIcon />}
                  primaryText={locationsPage.lists.map}
                  onClick={() => viewMap()}
                />
              )}
              {showDownloadOpt && (
                <LandingDownload
                  locations={locations || 0}
                  listID={id}
                  isLargeList={isLargeList}
                  hasErrorFile={hasErrorFile}
                  downloadRequestedFromFolder={isInFolder}
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
                  leftIcon={<KeyboardArrowUpIcon />}
                  primaryText="Submit"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowSubmitModal(true);
                  }}
                />
              )}
              <Divider />
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
              <MenuItem
                primaryText={
                  isInFolder ? locationsPage.lists.manage : locationsPage.lists.addToFolder
                }
                leftIcon={<FolderIcon />}
                onClick={() => {
                  setManageListFolderOpen();
                  setIsMenuOpen(false);
                }}
              />
              {showDelete && (
                <>
                  <Divider />
                  <MenuItem
                    primaryText={locationsPage.lists.delete}
                    className="MenuItem--danger"
                    leftIcon={<DeleteIcon />}
                    onClick={() => {
                      setDeleteDialogOpen();
                      setIsMenuOpen(false);
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
                setShowSubmitModal(false);
              }}
              dialogTitle="Confirm Submission"
              dialogMessage="Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete."
              dialogActionConfirm={() => {
                setShowSubmitModal(false);
                submitForAnalysis();
              }}
            />
          )}
        </div>
      </li>
    </>
  );
}

export default DraftList;
