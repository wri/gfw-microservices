import { useState } from 'react';
import {
  Dialog,
  Popover,
  Divider,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import DownloadLargeListFile from '../DownloadLargeListFile';
import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import { PillButton } from '../../../../../components';
import sharedColumnText from './sharedColumnText';
import FailedTooltip from '../../../../../common/js/components/CustomTooltip/FailedTooltip';
import { locationsPage, nav } from '../../../../../common/js/config';
import AnalysisListChips from './AnalysisListChips';
import ChangeTypeOfAnalysisModal from './ChangeTypeOfAnalysisModal';
import { useTransifexTranslation } from '../../../../../hooks/useTransifexTranslation';

function FailedList({
  list,
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

  const updateAnalysisLabel = useTransifexTranslation(locationsPage.lists.update);
  const changeTypeOfAnalysisLabel = useTransifexTranslation(
    locationsPage.lists.changeTypeOfAnalysis
  );
  const manageFolderLabel = useTransifexTranslation(locationsPage.lists.manage);
  const addToFolderLabel = useTransifexTranslation(locationsPage.lists.addToFolder);

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
            <PillButton
              size="small"
              variant="contained"
              color="info"
              sx={{ fontSize: '0.75rem', mr: 0.5, py: 0 }}
              onClick={handleRerunDialogState}
            >
              {updateAnalysisLabel}
            </PillButton>
          )}
          <span className="locations-list__failed">
            <FailedTooltip
              reason={isFailedByUsageLimits ? 'limits' : 'default'}
              placement="top"
              label={locationsPage.lists.failed}
              tooltipMessage={
                isFailedByUsageLimits
                  ? `This list was not processed because it would have exceeded your organization's current usage limits. Contact our team to increase limits. After limits have been increased, click "submit for analysis" to retry.`
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
                  <ListItemText>{changeTypeOfAnalysisLabel}</ListItemText>
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
                <ListItemText>{isInFolder ? manageFolderLabel : addToFolderLabel}</ListItemText>
              </MenuItem>
              {showDelete && (
                <>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setDeleteDialogOpen();
                      setIsMenuOpen(false);
                    }}
                    sx={{ '& .MuiSvgIcon-root, .MuiListItemText-primary': { color: 'error.main' } }}
                  >
                    <ListItemIcon>
                      <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText>{locationsPage.lists.delete}</ListItemText>
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
