import React from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
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
  return (
    <Paper>
      <div className="list-actions">
        <Button
          onClick={() => viewMap({ showFullListMap: true })}
          startIcon={<PublicIcon />}
          sx={greenButtonStyle}
        >
          List Map
        </Button>
        {(currentUser.access_level_id === userAccessLevel.ADMIN ||
          (selectedList &&
            currentUser.id === selectedList.user_id &&
            currentUser.access_level_id !== userAccessLevel.VIEWER)) &&
        selectedList &&
        selectedList.list_status_id !== 1 &&
        !getIsDiagnosticStatusDraft(selectedList) &&
        !selectedList.globalForestWatchList ? (
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
        ) : null}

        {selectedList && !selectedList.globalForestWatchList && (
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

        {currentUser.access_level_id === userAccessLevel.ADMIN &&
        selectedList &&
        selectedList.list_status_id !== 1 &&
        !selectedList.globalForestWatchList ? (
          <div id="ShareList">
            <Button
              onClick={() => showShareList(true)}
              sx={blackButtonStyle}
              startIcon={<FolderSharedIcon height="14px" />}
            >
              Share
            </Button>
          </div>
        ) : null}
        {(currentUser.access_level_id === userAccessLevel.ADMIN ||
          (currentUser.access_level_id !== userAccessLevel.ADMIN && userIsOwner)) &&
        selectedList &&
        selectedList.list_status_id !== 1 &&
        getIsDiagnosticStatusDraft(selectedList) &&
        !selectedList.globalForestWatchList ? (
          <div id="ShareList">
            <Button
              sx={blackButtonStyle}
              startIcon={<FolderSharedIcon height="14px" />}
              variant="primary"
              onClick={handleDraftSubmit}
            >
              Submit Analysis
            </Button>
          </div>
        ) : null}

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
      </div>
    </Paper>
  );
};

export default ListActions;
