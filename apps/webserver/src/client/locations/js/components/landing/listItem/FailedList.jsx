import { useState } from 'react';
import {
  Public as PublicIcon,
  Groups as GroupsIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Dialog,
  Popover,
  Divider,
  MenuList,
  MenuItem,
  ListItemIcon,
  Typography,
} from '@mui/material';

import DownloadLargeListFile from '../DownloadLargeListFile';
import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import Button from '../../../../../common/js/components/Button';
import sharedColumnText from './sharedColumnText';
import FailedTooltip from '../../../../../common/js/components/CustomTooltip/FailedTooltip';
import { locationsPage, nav } from '../../../../../common/js/config';
import AnalysisListChips from './AnalysisListChips';
import ChangeTypeOfAnalysisModal from './ChangeTypeOfAnalysisModal';

function FailedList({
  list,
  isAListSharedWithMe,
  showSharedColumn,
  showRerun,
  handleRerunDialogState,
  showDelete,
  setManageListFolderOpen,
  setDeleteDialogOpen,
  isFailedByUsageLimits,
  isPalmRiskActive,
}) {
  const [openDownloadLargeListFileDialog, setOpenDownloadLargeListFileDialog] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangeTypeOfAnalysisModalOpen, setIsChangeTypeOfAnalysisModalOpen] = useState(false);
  const { id, list_name, folder, is_shared, listAnalysesStatus } = list;
  const isInFolder = !!folder;

  const goToListDetails = () => {
    // clicked a location with a successfully completed analysis; go to it
    gtag('event', 'List click', {
      event_category: 'Landing',
      event_label: `user clicked on list ${list_name}`,
    });

    window.location = `/list-details?id=${id}${is_shared ? '&shared=true' : ''}`;
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

      <li className="locations-list locations-list--failed" onClick={goToListDetails}>
        <div className="locations-list__title">
          {isAListSharedWithMe && <PublicIcon />}
          {list_name}
          {is_shared && <IconUsers className="locations-list__shared-icon" />}
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
          <span className="locations-list__failed">
            <FailedTooltip
              reason={isFailedByUsageLimits ? 'limits' : 'default'}
              placement="top"
              label={locationsPage.lists.failed}
              tooltipMessage={
                isFailedByUsageLimits
                  ? `This list failed due to usage limits.`
                  : 'This list has failed analysis. To receive results, resubmit this list for analysis.'
              }
            />
          </span>
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
              {showRerun && (
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
                  {isInFolder ? locationsPage.lists.manage : locationsPage.lists.addToFolder}
                </Typography>
              </MenuItem>
              {showDelete && (
                <>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setDeleteDialogOpen();
                      setIsMenuOpen(false);
                    }}
                  >
                    <ListItemIcon sx={{ '& .MuiSvgIcon-root': { color: 'error.main' } }}>
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

      <Dialog
        modal
        open={openDownloadLargeListFileDialog}
        autoDetectWindowHeight={false}
        autoScrollBodyContent={false}
        contentStyle={{ width: '80%', maxWidth: 'none' }}
        children={
          <DownloadLargeListFile onCancel={() => setOpenDownloadLargeListFileDialog(false)} />
        }
      />
    </>
  );
}

export default FailedList;
