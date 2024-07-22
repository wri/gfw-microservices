import React, { useState } from 'react';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { Stack, Button, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PublishIcon from '@mui/icons-material/Publish';
import PublicIcon from '@mui/icons-material/Public';
import ReplayIcon from '@mui/icons-material/Replay';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CustomDialog from 'common/js/components/CustomDialog/CustomDialog';
import ManageListFolderDialog from 'locations/js/components/landing/ManageListFolderDialog';
import { getIsDiagnosticStatusDraft } from '../../../utils/draft.utils';
import { locationsPage, userAccessLevel } from '../../../../../common/js/config';
import { updateFolders } from '../../../../../locations/js/actions/locationActions';
import { getFolders } from 'locations/js/components/landing/foldersApi';
import { requestGeoTrellisAnalyzeList } from '../../../../../locations/js/utils/request.utils';
import store from '../../../../../locations/js/store';
import './ListActions.scss';

const ListActions = ({
  selectedList,
  viewMap,
  currentUser,
  handleRerunDialogState,
  rerunDialogState,
  rerunList,
  isManageListFolderOpen,
  setIsManageListFolderOpen,
  showShareList,
  handleDraftSubmit,
  draftSubmitDialogOpen,
  setDraftSubmitDialogOpen,
  setIsListSubmittedForAnalysis,
  isInFolder,
  folders,
  userIsOwner,
  setState,
  searchInputValue,
  handleSearchInputChange,
  handleSearchInputKeyDown,
  handlecSearchInputClick,
}) => {
  const blackButtonStyle = {
    color: 'black',
    padding: '0px 20px',
    '&:hover': {
      backgroundColor: 'none',
    },
  };
  const greenButtonStyle = {
    color: '#97bd3d',
    padding: '0px 20px',
    '&:hover': {
      backgroundColor: 'rgba(151, 189, 61, 0.2)',
    },
  };
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  const closeSearchBarHandler = () => {
    setIsSearchBarOpen(false);
    handleSearchInputChange('');
  };
  const isRerunListAvailable =
    (currentUser.access_level_id === userAccessLevel.ADMIN ||
      (selectedList &&
        currentUser.id === selectedList.user_id &&
        currentUser.access_level_id !== userAccessLevel.VIEWER &&
        selectedList &&
        selectedList.list_status_id !== 1 &&
        !getIsDiagnosticStatusDraft(selectedList) &&
        !selectedList.globalForestWatchList)) &&
    !isSearchBarOpen;

  const isShareOptionAvailable =
    currentUser.access_level_id === userAccessLevel.ADMIN &&
    selectedList &&
    selectedList.list_status_id !== 1 &&
    !selectedList.globalForestWatchList &&
    !isSearchBarOpen;

  const isSubmitOptionAvailable =
    (currentUser.access_level_id === userAccessLevel.ADMIN ||
      (currentUser.access_level_id !== userAccessLevel.ADMIN && userIsOwner)) &&
    selectedList &&
    selectedList.list_status_id !== 1 &&
    getIsDiagnosticStatusDraft(selectedList) &&
    !selectedList.globalForestWatchList &&
    !isSearchBarOpen;

  const isAddToFolderOptionAvailable =
    selectedList && !selectedList.globalForestWatchList && !isSearchBarOpen;

  return (
    <>
      <Paper className="list-actions">
        <Stack
          sx={{
            width: '100%',
          }}
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          {isSearchBarOpen && (
            <>
              <IconButton sx={{ p: '10px' }} aria-label="menu" onClick={handlecSearchInputClick}>
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  width: '100%',
                  '& .MuiInputBase-input': {
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                  },
                  '& .MuiInputBase-input:focus': {
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                  },
                }}
                value={searchInputValue}
                onChange={(event) => handleSearchInputChange(event.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                placeholder="Type your search and press Enter..."
                inputProps={{ 'aria-label': 'Type your search and press Enter' }}
              />
            </>
          )}
          <Stack alignItems="center" direction="row">
            {!isSearchBarOpen && (
              <Button
                onClick={() => viewMap({ showFullListMap: true })}
                startIcon={<PublicIcon />}
                sx={greenButtonStyle}
              >
                List Map
              </Button>
            )}
            {isRerunListAvailable && (
              <div id="RerunList" className="selected-rerun-list">
                <Button
                  sx={blackButtonStyle}
                  onClick={handleRerunDialogState}
                  startIcon={<ReplayIcon height="14px" />}
                >
                  Update Analysis
                </Button>
                <CustomDialog
                  open={rerunDialogState}
                  closeAction={handleRerunDialogState}
                  dialogTitle={locationsPage.lists.rerunListDialog.title}
                  dialogMessage={locationsPage.lists.rerunListDialog.text}
                  dialogActionConfirm={rerunList}
                />
              </div>
            )}

            {isAddToFolderOptionAvailable && (
              <div>
                <Button
                  startIcon={<DriveFileMoveIcon />}
                  onClick={() => setIsManageListFolderOpen(true)}
                  sx={blackButtonStyle}
                >
                  {isInFolder ? locationsPage.lists.manage : locationsPage.lists.addToFolder}
                </Button>
                <ManageListFolderDialog
                  isOpen={isManageListFolderOpen}
                  folders={folders}
                  list={selectedList}
                  onCancel={() => setIsManageListFolderOpen(false)}
                  onComplete={(msg) => {
                    getFolders().then((foldersLocal) => {
                      store.dispatch(updateFolders(foldersLocal));
                      const currentFolderLocal =
                        folders && folders.length > 0
                          ? folders.find((folder) =>
                              folder.lists && folder.lists.length > 0
                                ? folder.lists.find((listId) => listId === selectedList.id)
                                : null
                            )
                          : null;
                      setState({
                        bannerContent: msg,
                        isManageListFolderOpen: false,
                        currentFolder: currentFolderLocal,
                      });
                    });
                  }}
                />
              </div>
            )}

            {isShareOptionAvailable && (
              <div id="ShareList">
                <Button
                  onClick={() => showShareList(true)}
                  sx={blackButtonStyle}
                  startIcon={<FolderSharedIcon height="14px" />}
                >
                  Share
                </Button>
              </div>
            )}

            {isSubmitOptionAvailable && (
              <div id="ShareList">
                <Button
                  sx={blackButtonStyle}
                  startIcon={<PublishIcon height="14px" />}
                  variant="primary"
                  onClick={handleDraftSubmit}
                >
                  Submit Analysis
                </Button>
              </div>
            )}
          </Stack>

          {!isSearchBarOpen ? (
            <Button
              sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
              onClick={() => setIsSearchBarOpen(true)}
            >
              <SearchIcon sx={{ color: 'black' }} />{' '}
            </Button>
          ) : (
            <Button
              sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
              onClick={closeSearchBarHandler}
            >
              <ClearIcon sx={{ color: 'black' }} />
            </Button>
          )}
        </Stack>
      </Paper>
      <CustomDialog
        open={draftSubmitDialogOpen}
        closeAction={() => setDraftSubmitDialogOpen(false)}
        dialogTitle={locationsPage.lists.submitListDialog.title}
        dialogMessage={locationsPage.lists.submitListDialog.message}
        dialogActionConfirm={() => {
          requestGeoTrellisAnalyzeList(selectedList)
            .then(() => {
              gtag('event', 'Submit List', {
                event_category: 'Submit',
                event_label: 'User submits a list for analysis',
              });
              gtag('event', 'Submit List', {
                event_category: 'Submit',
                event_label: 'User submits a list from listview page',
              });
              setIsListSubmittedForAnalysis(true);
              window.location = '/locations';
            })
            .catch((error) => {
              console.log(error);
            })
            .finally(() => {
              setDraftSubmitDialogOpen(false);
            });
        }}
      />
    </>
  );
};

export default ListActions;
