import { useState } from 'react';
import { connect } from 'react-redux';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { Stack, Button, Paper } from '@mui/material';
import {
  Search,
  Clear,
  Publish,
  Public,
  Replay,
  DriveFileMove,
  FolderShared,
  Delete,
  Add,
} from '@mui/icons-material/';
import redirectToMap from '../../../../../common/js/utils/redirect';

import ListDownloadMenu from '../download/ListDownloadMenu';
import CustomDialog from 'common/js/components/CustomDialog/CustomDialog';
import ManageListFolderDialog from 'locations/js/components/landing/ManageListFolderDialog';
import { getIsDiagnosticStatusDraft } from '../../../utils/draft.utils';
import { locationsPage, userAccessLevel } from '../../../../../common/js/config';
import { updateFolders } from '../../../../../locations/js/actions/locationActions';
import { getFolders } from 'locations/js/components/landing/foldersApi';
import { requestGeoTrellisAnalyzeList } from '../../../../../locations/js/utils/requestUtils';
import { useTransifexTranslation } from '../../../../../hooks';
import store from '../../../../../locations/js/store';
import './ListActions.scss';
import { gfwListNames } from '../../../../../common/js/constants/lists.constants';
import { GFW_LISTS_NUMBER_CONSTANTS } from '../../../../../../config/env/gfwLists.constants';

const ListActions = ({
  selectedList,
  userSharedLists,
  currentUser,
  toggleReRunAnalysisDialog,
  rerunDialogState,
  rerunList,
  isManageListFolderOpen,
  setIsManageListFolderOpen,
  showShareList,
  handleDraftSubmit,
  draftSubmitDialogOpen,
  setDraftSubmitDialogOpen,
  setIsListSubmittedForAnalysis,
  isListSubmittedForAnalysis,
  isInFolder,
  folders,
  userIsOwner,
  setState,
  searchInputValue,
  handleSearchInputChange,
  handleSearchInputKeyDown,
  handleSearchInputClick,
  showMultipleSelectionBulkActions,
  canMove,
  promptMoveSelectedLocations,
  canDelete,
  promptDeleteSelectedLocations,
  filters,
  listFilterStr,
  tableSortedBy,
  tableSortedDesc,
  visibleColumns,
  selectedLocations,
  listView,
  isLoading,
  isGfwList,
  isOnlyGHGActive,
  isEveryRowSelected,
  isDraftWithoutDiagnostic,
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

  const redirectUploadLocationUrl = `upload-location&fromList=${selectedList?.id}`;

  const closeSearchBarHandler = () => {
    setIsSearchBarOpen(false);
    handleSearchInputChange('');
  };

  const viewMap = ({ showFullListMap }) => {
    const isGfwList = selectedList.isGlobalForestWatchList;
    const isSharedList =
      selectedList &&
      userSharedLists?.map((userSharedList) => userSharedList.id).includes(selectedList.id);

    const sendData = {
      listId: selectedList.id,
      isGfwList,
      isSharedList,
      ...(isEveryRowSelected || showFullListMap ? {} : { selectedLocations }),
    };
    redirectToMap(sendData);
    gtag('event', 'Header button click', {
      event_category: 'Lists Click',
      event_label: 'user is re-directed to the map page via a Lists Header button click',
    });
  };
  const isShareOptionAvailable =
    currentUser.access_level_id === userAccessLevel.ADMIN &&
    selectedList &&
    selectedList.list_status_id !== 1 &&
    !selectedList.isGlobalForestWatchList &&
    !showMultipleSelectionBulkActions &&
    !isSearchBarOpen;

  const isSubmitOptionAvailable =
    (currentUser.access_level_id === userAccessLevel.ADMIN ||
      (currentUser.access_level_id !== userAccessLevel.ADMIN && userIsOwner)) &&
    selectedList?.list_status_id !== 1 &&
    getIsDiagnosticStatusDraft(selectedList) &&
    !selectedList?.isGlobalForestWatchList &&
    !isSearchBarOpen &&
    !isListSubmittedForAnalysis &&
    !isOnlyGHGActive;

  const isUpdateAnalysisAvailable =
    (currentUser.access_level_id === userAccessLevel.ADMIN ||
      (currentUser.id === selectedList.user_id &&
        currentUser.access_level_id !== userAccessLevel.VIEWER)) &&
    selectedList?.list_status_id !== 1 &&
    !getIsDiagnosticStatusDraft(selectedList) &&
    !selectedList?.isGlobalForestWatchList &&
    !showMultipleSelectionBulkActions &&
    !isSearchBarOpen;

  const isAddToFolderOptionAvailable =
    selectedList &&
    !selectedList.isGlobalForestWatchList &&
    !showMultipleSelectionBulkActions &&
    !isSearchBarOpen;

  const viewMapButtonLabel = showMultipleSelectionBulkActions
    ? useTransifexTranslation('Location(s) Map')
    : useTransifexTranslation('List Map');

  const { ADMINISTRATIVE_AREAS } = GFW_LISTS_NUMBER_CONSTANTS;
  const isMapAvailable = !(
    selectedList.isGlobalForestWatchList &&
    selectedList?.list_name === gfwListNames[ADMINISTRATIVE_AREAS - 1] &&
    selectedLocations.length < 1
  );

  const searchInputLabel = useTransifexTranslation('Type your search and press Enter...');
  const updateAnalysisButtonLabel = useTransifexTranslation('Update Analysis');
  const submitAnalysisButtonLabel = useTransifexTranslation(
    isDraftWithoutDiagnostic ? 'Submit Analysis' : 'Re-Analyze List'
  );
  const addLocationsButtonLabel = useTransifexTranslation('Add Locations');

  const folderActionButtonLabel = isInFolder
    ? useTransifexTranslation(locationsPage.lists.manage)
    : useTransifexTranslation(locationsPage.lists.addToFolder);
  const deleteButtonLabel = useTransifexTranslation('Delete');
  const shareButtonLabel = useTransifexTranslation('Share');
  const copyMoveButtonLabel = useTransifexTranslation(isGfwList ? 'Copy' : 'Copy/Move');

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
              <IconButton sx={{ p: '10px' }} aria-label="menu" onClick={handleSearchInputClick}>
                <Search />
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
                placeholder={searchInputLabel}
                inputProps={{ 'aria-label': 'Type your search and press Enter' }}
              />
            </>
          )}
          <Stack alignItems="center" direction="row">
            {!isSearchBarOpen && isMapAvailable && (
              <Button
                onClick={() => viewMap({ showFullListMap: !showMultipleSelectionBulkActions })}
                startIcon={<Public />}
                sx={greenButtonStyle}
                data-cy={showMultipleSelectionBulkActions ? 'locations-map' : 'full-list-map'}
              >
                {viewMapButtonLabel}
              </Button>
            )}

            {isUpdateAnalysisAvailable && (
              <div id="RerunList" className="selected-rerun-list">
                <Button
                  sx={blackButtonStyle}
                  onClick={toggleReRunAnalysisDialog}
                  startIcon={<Replay height="14px" />}
                >
                  {updateAnalysisButtonLabel}
                </Button>
                <CustomDialog
                  open={rerunDialogState}
                  closeAction={toggleReRunAnalysisDialog}
                  dialogTitle={locationsPage.lists.rerunListDialog.title}
                  dialogMessage={locationsPage.lists.rerunListDialog.text}
                  dialogActionConfirm={rerunList}
                />
              </div>
            )}
            {isSubmitOptionAvailable && (
              <div>
                <Button
                  sx={blackButtonStyle}
                  startIcon={<Publish height="14px" />}
                  onClick={handleDraftSubmit}
                >
                  {submitAnalysisButtonLabel}
                </Button>
              </div>
            )}
            {!isSearchBarOpen && !isGfwList && (
              <Button
                sx={blackButtonStyle}
                startIcon={<Add height="14px" />}
                href={`/locations?redirectTo=${redirectUploadLocationUrl}`}
              >
                {addLocationsButtonLabel}
              </Button>
            )}

            {isAddToFolderOptionAvailable && (
              <div>
                <Button
                  startIcon={<DriveFileMove />}
                  onClick={() => setIsManageListFolderOpen(true)}
                  sx={blackButtonStyle}
                >
                  {folderActionButtonLabel}
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
              <div>
                <Button
                  onClick={() => showShareList(true)}
                  sx={blackButtonStyle}
                  startIcon={<FolderShared height="14px" />}
                  data-cy="share-list"
                >
                  {shareButtonLabel}
                </Button>
              </div>
            )}

            {canMove && showMultipleSelectionBulkActions && !isSearchBarOpen && (
              <Button
                sx={blackButtonStyle}
                startIcon={<DriveFileMove height="14px" />}
                variant="primary"
                onClick={promptMoveSelectedLocations}
              >
                {copyMoveButtonLabel}
              </Button>
            )}

            {showMultipleSelectionBulkActions && !isSearchBarOpen && (
              <ListDownloadMenu
                listID={selectedList?.id}
                listName={selectedList?.list_name}
                filters={filters}
                listFilterStr={listFilterStr}
                tableSortedBy={tableSortedBy}
                tableSortedDesc={tableSortedDesc}
                selectedList={selectedList}
                combinedColumns={visibleColumns}
                selectedLocations={selectedLocations}
                currentUser={currentUser}
                listView={listView}
                isLoading={isLoading}
                isGfwList={isGfwList}
              />
            )}

            {canDelete && showMultipleSelectionBulkActions && !isSearchBarOpen && (
              <Button
                sx={{ ...blackButtonStyle, color: 'red' }}
                startIcon={<Delete height="14px" />}
                variant="primary"
                onClick={promptDeleteSelectedLocations}
              >
                {deleteButtonLabel}
              </Button>
            )}
          </Stack>

          <div>
            {!isSearchBarOpen ? (
              <Button
                sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
                onClick={() => setIsSearchBarOpen(true)}
              >
                <Search sx={{ color: 'black' }} />
              </Button>
            ) : (
              <Button
                sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
                onClick={closeSearchBarHandler}
              >
                <Clear sx={{ color: 'black' }} />
              </Button>
            )}
          </div>
        </Stack>
      </Paper>
      <CustomDialog
        open={draftSubmitDialogOpen}
        closeAction={() => setDraftSubmitDialogOpen(false)}
        dialogTitle={locationsPage.lists.submitListDialog.title}
        dialogMessage={locationsPage.lists.submitListDialog.message}
        dialogActionConfirm={() => {
          const analysisTypes = selectedList.listAnalysesStatus.map(
            (analysis) => analysis.analysisId
          );

          requestGeoTrellisAnalyzeList(selectedList, analysisTypes.join(','))
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

const mapStateToProps = (state) => ({
  selectedList: state.selectedLists[0],
  folders: state.userFolders,
  filters: state.filters,
  selectedLocations: state.selectedLocations,
  listView: state.listView,
  isGfwList: state.selectedLists[0]?.isGlobalForestWatchList,
});

const mapDispatchToProps = (dispatch) => ({
  showShareList: (value) => dispatch({ type: 'SHOW_SHARE_LIST', payload: value }),
  updateSelectedLocations: (locations) =>
    dispatch({ type: 'UPDATE_SELECTED_LOCATIONS', payload: locations }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListActions);
