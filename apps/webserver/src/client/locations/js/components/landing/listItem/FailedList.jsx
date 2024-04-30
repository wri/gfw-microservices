import React, { useState } from 'react';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
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
}) {
  const [openDownloadLargeListFileDialog, setOpenDownloadLargeListFileDialog] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangeTypeOfAnalysisModalOpen, setIsChangeTypeOfAnalysisModalOpen] = useState(false);
  const { id, list_name, large_list_id, folder, is_shared, listAnalysesStatus } = list;
  const isLargeList = !!large_list_id;
  const isInFolder = !!folder;
  return (
    <>
      <ChangeTypeOfAnalysisModal
        listId={id}
        listName={list_name}
        listAnalysesStatus={listAnalysesStatus}
        setIsChangeTypeOfAnalysisModalOpen={setIsChangeTypeOfAnalysisModalOpen}
        isChangeTypeOfAnalysisModalOpen={isChangeTypeOfAnalysisModalOpen}
      />

      <li className="locations-list locations-list--failed">
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
                  : `This list has failed analysis. To receive results, resubmit this list for analysis. ${
                      isLargeList ? 'Click to download the file and fix errors.' : ''
                    }`
              }
              onClickAction={
                isLargeList
                  ? () => {
                      setOpenDownloadLargeListFileDialog(true);
                    }
                  : undefined
              }
            />
          </span>
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
              <MenuItem
                primaryText={locationsPage.lists.changeTypeOfAnalysis}
                leftIcon={<SettingsIcon />}
                onClick={() => {
                  setIsChangeTypeOfAnalysisModalOpen(true);
                  setIsMenuOpen(false);
                }}
              />
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
