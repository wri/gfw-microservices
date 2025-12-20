import { useState } from 'react';
import {
  Chip,
  Divider,
  MenuList,
  MenuItem,
  Popover,
  ListItemIcon,
  Typography,
} from '@mui/material';
import {
  Public as PublicIcon,
  Groups as GroupsIcon,
  QueryStats as QueryStatsIcon,
  Place as PlaceIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import Button from '../../../../../common/js/components/Button';
import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import sharedColumnText from './sharedColumnText';
import redirectToMap from '../../../../../common/js/utils/redirect';
import LandingDownload from '../../lists/download/LandingDownload';
import { numberWithCommas } from '../../../utils/locationsTableUtils';
import ChangeTypeOfAnalysisModal from './ChangeTypeOfAnalysisModal';
import AnalysisListChips from './AnalysisListChips';
import { locationsPage, nav } from '../../../../../common/js/config';
import getActiveAnalysisType from '../../../../../../utils/getActiveAnalysisType';
import CustomTooltip from '../../../../../common/js/components/CustomTooltip/CustomTooltip';
import { proLayers } from '../../../../../common/js/proLayers.config';
import { formatDateForCurrentBrowserLanguage } from '../../../../../common/js/utils/format';
import { PillButton } from '../../../../../components';

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
  isPalmRiskActive,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  const isEmptyList = locations === 0;
  const showDiagnosticOpt = !is_shared && !isEmptyList && getActiveAnalysisType(listAnalysesStatus);

  const getAnalysisLastUpdatedDate = () => {
    const analysisUpdateTime =
      Array.isArray(listAnalysesStatus) && listAnalysesStatus[0]?.updateTime;

    return analysisUpdateTime
      ? `Analysis updated: ${formatDateForCurrentBrowserLanguage(analysisUpdateTime)}`
      : '';
  };

  const clickLocationRow = () => {
    // clicked a location with a successfully completed analysis; go to it
    gtag('event', 'List click', {
      event_category: 'Landing',
      event_label: `user clicked on list ${list_name}`,
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

      <li className="locations-list" onClick={clickLocationRow}>
        <CustomTooltip
          placement="bottom-end"
          tooltipMessage={getAnalysisLastUpdatedDate()}
          style={{ minWidth: '250px' }}
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
        </CustomTooltip>

        {showSharedColumn && (
          <div className="locations-list__shared">
            <GroupsIcon />
            {sharedColumnText()}
          </div>
        )}

        <div className="locations-list__controls">
          <AnalysisListChips listAnalysesStatus={listAnalysesStatus} />

          {showRerun && (
            <PillButton
              onClick={handleRerunDialogState}
              size="small"
              variant="contained"
              color="info"
              sx={{ fontSize: '0.75rem', mr: 0.5, py: 0 }}
            >
              {locationsPage.lists.update}
            </PillButton>
          )}
        </div>

        <div className="locations-list__menu-container" onClick={(e) => e.stopPropagation()}>
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
            onClose={() => setIsMenuOpen(false)}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuList
              className="context-menu"
              sx={{
                '.MuiMenuItem-root': { gap: 1 },
                svg: { fontSize: '1.25rem', color: 'text.primary' },
              }}
            >
              {showDiagnosticOpt && (
                <MenuItem
                  onClick={() => {
                    const diagnosticsType = getActiveAnalysisType(listAnalysesStatus);
                    window.location = `/diagnostics?listId=${id}&type=${diagnosticsType}`;
                  }}
                >
                  <ListItemIcon>
                    <QueryStatsIcon />
                  </ListItemIcon>
                  <Typography variant="body1">{locationsPage.lists.diagnostic}</Typography>
                </MenuItem>
              )}
              {showMapOpt && (
                <MenuItem onClick={viewMap}>
                  <ListItemIcon>
                    <PlaceIcon />
                  </ListItemIcon>
                  <Typography variant="body1">{locationsPage.lists.map}</Typography>
                </MenuItem>
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
                <MenuItem onClick={(e) => shareList(e, list)}>
                  <ListItemIcon>
                    <ShareIcon />
                  </ListItemIcon>
                  <Typography variant="body1">{locationsPage.lists.share}</Typography>
                </MenuItem>
              )}
              {showRerunOpt && (
                <MenuItem
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleRerunDialogState(e);
                  }}
                >
                  <ListItemIcon>
                    <RefreshIcon />
                  </ListItemIcon>
                  <Typography variant="body1">{locationsPage.lists.update}</Typography>
                </MenuItem>
              )}

              <Divider />
              <MenuItem
                onClick={() => {
                  setManageListFolderOpen();
                  setIsMenuOpen(false);
                }}
              >
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <Typography variant="body1">
                  {folder ? locationsPage.lists.manage : locationsPage.lists.addToFolder}
                </Typography>
              </MenuItem>

              {showDiagnosticOpt && (
                <MenuItem
                  onClick={() => {
                    setIsChangeTypeOfAnalysisModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <Typography variant="body1">
                    {locationsPage.lists.changeTypeOfAnalysis}
                  </Typography>
                </MenuItem>
              )}
              {showDelete && (
                <>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setDeleteDialogOpen();
                      setIsMenuOpen(false);
                    }}
                    sx={{ '& .MuiSvgIcon-root, p': { color: 'error.main' } }}
                  >
                    <ListItemIcon>
                      <DeleteIcon />
                    </ListItemIcon>
                    <Typography variant="body1">{locationsPage.lists.delete}</Typography>
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Popover>
        </div>
      </li>
    </>
  );
}

export default ActiveList;
