import { useState } from 'react';
import { Chip } from '@mui/material';
import { Popover, Divider, Menu, MenuItem } from 'material-ui';
import {
  Public as PublicIcon,
  Groups as GroupsIcon,
  QueryStats as QueryStatsIcon,
  Place as PlaceIcon,
  Share as ShareIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import ListDiagnosticStatusDraft from '../components/ListDiagnosticStatusDraft/ListDiagnosticStatusDraft';
import CustomTooltip from '../../../../../common/js/components/CustomTooltip/CustomTooltip';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import sharedColumnText from './sharedColumnText';
import redirectToMap from '../../../../../common/js/utils/redirect';
import LandingDownload from '../../lists/download/LandingDownload';
import { numberWithCommas } from '../../../utils/locationsTableUtils';
import ChangeTypeOfAnalysisModal from './ChangeTypeOfAnalysisModal';
import AnalysisListChips from './AnalysisListChips';
import CustomDialog from '../../../../../common/js/components/CustomDialog/CustomDialog';
import { locationsPage, draftTooltipMessages, nav } from '../../../../../common/js/config';
import { proLayers } from '../../../../../common/js/proLayers.config';

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
  isPalmRiskActive,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isChangeTypeOfAnalysisModalOpen, setIsChangeTypeOfAnalysisModalOpen] = useState(false);
  const {
    list_name,
    id,
    is_shared,
    folder,
    error_file_storage_path,
    large_list_id,
    listAnalysesStatus,
  } = list;
  const isLargeList = !!large_list_id;
  const hasErrorFile = !!error_file_storage_path;
  const isInFolder = !!folder;
  const isDiagnosticAvailable = !!list.dashboard_last_results;

  const clickLocationRow = () => {
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
      visibleLayers: [proLayers.treeCoverLossID],
      listId: id,
      isSharedList: is_shared,
    };

    redirectToMap(sendData);
  };

  return (
    <>
      <ChangeTypeOfAnalysisModal
        listId={id}
        listName={list_name}
        listAnalysesStatus={listAnalysesStatus}
        setIsChangeTypeOfAnalysisModalOpen={setIsChangeTypeOfAnalysisModalOpen}
        isChangeTypeOfAnalysisModalOpen={isChangeTypeOfAnalysisModalOpen}
        commodity={list?.Commodity}
        isPalmRiskActive={isPalmRiskActive}
      />

      <li
        className="locations-list"
        title={locationsPage.landing.draftMessage}
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

          <ListDiagnosticStatusDraft
            submitForAnalysis={submitForAnalysis}
            hideSubmit={showRerunOpt}
          />
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
              {isDiagnosticAvailable && (
                <MenuItem
                  primaryText={locationsPage.lists.diagnostic}
                  leftIcon={<QueryStatsIcon />}
                  onClick={() => {
                    window.location = `/diagnostics?listId=${id}`;
                  }}
                />
              )}
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
                  primaryText="Submit Analysis"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowSubmitModal(true);
                  }}
                />
              )}
              <Divider />

              {showRerunOpt && !hasErrorFile && (
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
            <CustomDialog
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
