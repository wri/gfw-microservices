import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ListActions from './ListActions';

jest.mock('../../../../../common/js/utils/redirect');
jest.mock('../../../../../common/js/utils/errorLogger');
jest.mock('../../../../../locations/js/utils/requestUtils');
jest.mock('../../../../../locations/js/components/landing/foldersApi');
jest.mock('../../../../../locations/js/actions/locationActions');
jest.mock('../../../../../locations/js/components/landing/ManageListFolderDialog', () => {
  return function ManageListFolderDialog({ isOpen, onComplete, onCancel }) {
    if (!isOpen) {
      return null;
    }
    return (
      <div data-testid="manage-list-folder-dialog">
        <button onClick={() => onComplete('List added to folder successfully')}>Complete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

const redirectToMap = require('../../../../../common/js/utils/redirect').default;
const errorLogger = require('../../../../../common/js/utils/errorLogger').default;
const { requestGeoTrellisAnalyzeList } = require('../../../../../locations/js/utils/requestUtils');
const { getFolders } = require('../../../../../locations/js/components/landing/foldersApi');
const { updateFolders } = require('../../../../../locations/js/actions/locationActions');
const realStore = require('../../../../../locations/js/store').default;

const theme = createTheme();

const mockStore = {
  selectedLists: [
    {
      id: '1',
      name: 'Test List',
      isGlobalForestWatchList: false,
      list_locations_count: 5,
      error_file_storage_path: null,
      listAnalysesStatus: [{ analysisId: 1 }, { analysisId: 2 }],
    },
  ],
  userFolders: [],
  filters: {},
  selectedLocations: [],
  listView: 'table',
};

const currentUser = {
  id: '1',
  username: 'testuser',
  access_level_id: 1,
};

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn((selector) => selector(mockStore)),
  useDispatch: () => mockDispatch,
}));

describe('ListActions', () => {
  let store;

  const mockFunction = jest.fn();
  let storeDispatchSpy;

  beforeEach(() => {
    store = createStore(() => mockStore);
    mockDispatch.mockClear();
    redirectToMap.mockClear();
    errorLogger.error = jest.fn();
    requestGeoTrellisAnalyzeList.mockClear();
    getFolders.mockClear();
    updateFolders.mockClear();

    storeDispatchSpy = jest.spyOn(realStore, 'dispatch').mockImplementation(jest.fn());

    global.gtag = jest.fn();

    global.window.Transifex = {
      live: {
        onAfterTranslate: jest.fn(),
      },
    };

    mockFunction.mockClear();
  });

  afterEach(() => {
    if (storeDispatchSpy) {
      storeDispatchSpy.mockRestore();
    }
  });
  it('renders action buttons correctly', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={{}}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            tableSortedBy=""
            tableSortedDesc={false}
            selectedLocations={[]}
            isEveryRowSelected={false}
            userIsOwner={false}
            showMultipleSelectionBulkActions={false}
            isEditActionAvailable={false}
            canMove={false}
            canDelete={false}
          />
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByText('Add Locations')).toBeInTheDocument();
    expect(screen.getByText('List Map')).toBeInTheDocument();
  });

  it('renders bulk action buttons when multiple selections are made', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={{}}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={true}
            canMove={true}
            canDelete={true}
            promptMoveSelectedLocations={mockFunction}
            promptDeleteSelectedLocations={mockFunction}
          />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText('Copy/Move')).toBeInTheDocument();

    expect(screen.getByText('Delete')).toBeInTheDocument();

    expect(screen.queryByText('Share')).not.toBeInTheDocument();

    expect(screen.queryByText('Update Analysis')).not.toBeInTheDocument();
  });

  it('calls viewMap function when map button is clicked', async () => {
    const user = userEvent.setup();
    const selectedList = {
      id: '1',
      list_name: 'Test List',
      list_status_id: 2,
      isGlobalForestWatchList: false,
      list_locations_count: 5,
      error_file_storage_path: null,
    };

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={selectedList}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
            userIsOwner={true}
            selectedLocations={[]}
            isEveryRowSelected={false}
          />
        </ThemeProvider>
      </Provider>
    );

    const mapButton = screen.getByText('List Map');
    await user.click(mapButton);

    expect(redirectToMap).toHaveBeenCalled();
    expect(global.gtag).toHaveBeenCalledWith('event', 'Header button click', expect.any(Object));
  });

  it('opens search bar when search icon is clicked', async () => {
    const user = userEvent.setup();
    const handleSearchInputChange = jest.fn();
    const handleSearchInputClick = jest.fn();

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={{}}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
            handleSearchInputChange={handleSearchInputChange}
            handleSearchInputClick={handleSearchInputClick}
            searchInputValue=""
          />
        </ThemeProvider>
      </Provider>
    );

    const searchButton = screen.getByTestId('search-icon-button');
    expect(searchButton).toBeInTheDocument();

    await user.click(searchButton);

    const searchInput = screen.getByPlaceholderText(/Type your search and press Enter/i);
    expect(searchInput).toBeInTheDocument();

    const clearButton = screen.getByTestId('clear-search-button');
    expect(clearButton).toBeInTheDocument();

    await user.type(searchInput, 'test search');

    expect(handleSearchInputChange).toHaveBeenCalled();
    expect(handleSearchInputChange.mock.calls.length).toBeGreaterThan(0);

    await user.click(clearButton);

    expect(handleSearchInputChange).toHaveBeenCalledWith('');
  });

  it('calls showShareList when share button is clicked', async () => {
    const user = userEvent.setup();
    const showShareList = jest.fn();
    const selectedList = {
      id: '1',
      list_name: 'Test List',
      list_status_id: 2,
      isGlobalForestWatchList: false,
      list_locations_count: 5,
      error_file_storage_path: null,
    };

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={{ ...currentUser, access_level_id: 1 }}
            selectedList={selectedList}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={showShareList}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            searchInputValue=""
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
            userIsOwner={true}
          />
        </ThemeProvider>
      </Provider>
    );

    const shareButton = screen.getByText('Share');
    await user.click(shareButton);

    expect(showShareList).toHaveBeenCalledWith(true);
  });

  it('calls setIsManageListFolderOpen when folder button is clicked', async () => {
    const user = userEvent.setup();
    const setIsManageListFolderOpen = jest.fn();
    const selectedList = {
      id: '1',
      list_name: 'Test List',
      list_status_id: 2,
      isGlobalForestWatchList: false,
      list_locations_count: 5,
      error_file_storage_path: null,
    };

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={selectedList}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={setIsManageListFolderOpen}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            searchInputValue=""
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
            userIsOwner={true}
            folders={[]}
          />
        </ThemeProvider>
      </Provider>
    );

    const folderButton = screen.getByText(/add to folder/i);
    await user.click(folderButton);

    expect(setIsManageListFolderOpen).toHaveBeenCalledWith(true);
  });

  it('calls promptMoveSelectedLocations when copy/move button is clicked', async () => {
    const user = userEvent.setup();
    const promptMoveSelectedLocations = jest.fn();

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={{}}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={true}
            canMove={true}
            canDelete={false}
            promptMoveSelectedLocations={promptMoveSelectedLocations}
          />
        </ThemeProvider>
      </Provider>
    );

    const copyMoveButton = screen.getByText('Copy/Move');
    await user.click(copyMoveButton);

    expect(promptMoveSelectedLocations).toHaveBeenCalled();
  });

  it('calls promptDeleteSelectedLocations when delete button is clicked', async () => {
    const user = userEvent.setup();
    const promptDeleteSelectedLocations = jest.fn();

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={{}}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={true}
            canMove={false}
            canDelete={true}
            promptDeleteSelectedLocations={promptDeleteSelectedLocations}
          />
        </ThemeProvider>
      </Provider>
    );

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(promptDeleteSelectedLocations).toHaveBeenCalled();
  });

  it('renders draft submit dialog when open', () => {
    const setDraftSubmitDialogOpen = jest.fn();

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={{ listAnalysesStatus: [{ analysisId: 1 }] }}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={true}
            setDraftSubmitDialogOpen={setDraftSubmitDialogOpen}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
          />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls setDraftSubmitDialogOpen when Cancel button is clicked in draft submit dialog', async () => {
    const user = userEvent.setup();
    const setDraftSubmitDialogOpen = jest.fn();

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={{ listAnalysesStatus: [{ analysisId: 1 }] }}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={true}
            setDraftSubmitDialogOpen={setDraftSubmitDialogOpen}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
          />
        </ThemeProvider>
      </Provider>
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(setDraftSubmitDialogOpen).toHaveBeenCalledWith(false);
  });

  it('submits list for analysis when OK button is clicked in draft submit dialog', async () => {
    const user = userEvent.setup();
    const setDraftSubmitDialogOpen = jest.fn();
    const setIsListSubmittedForAnalysis = jest.fn();

    requestGeoTrellisAnalyzeList.mockResolvedValue({ success: true });

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={mockStore.selectedLists[0]}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={true}
            setDraftSubmitDialogOpen={setDraftSubmitDialogOpen}
            setIsListSubmittedForAnalysis={setIsListSubmittedForAnalysis}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
          />
        </ThemeProvider>
      </Provider>
    );

    const okButton = screen.getByText('OK');
    await user.click(okButton);

    await waitFor(() => {
      expect(requestGeoTrellisAnalyzeList).toHaveBeenCalled();
    });

    expect(requestGeoTrellisAnalyzeList).toHaveBeenCalledWith(mockStore.selectedLists[0], '1,2');
    expect(setIsListSubmittedForAnalysis).toHaveBeenCalledWith(true);
    expect(setDraftSubmitDialogOpen).toHaveBeenCalledWith(false);
    expect(global.gtag).toHaveBeenCalledWith('event', 'Submit List', expect.any(Object));
  });

  it('handles error when submitting list for analysis fails', async () => {
    const user = userEvent.setup();
    const setDraftSubmitDialogOpen = jest.fn();
    const setIsListSubmittedForAnalysis = jest.fn();
    const mockError = new Error('API Error');

    requestGeoTrellisAnalyzeList.mockRejectedValue(mockError);

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={mockStore.selectedLists[0]}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={false}
            setIsManageListFolderOpen={mockFunction}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={true}
            setDraftSubmitDialogOpen={setDraftSubmitDialogOpen}
            setIsListSubmittedForAnalysis={setIsListSubmittedForAnalysis}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
          />
        </ThemeProvider>
      </Provider>
    );

    const okButton = screen.getByText('OK');
    await user.click(okButton);

    await waitFor(() => {
      expect(errorLogger.error).toHaveBeenCalled();
    });

    expect(requestGeoTrellisAnalyzeList).toHaveBeenCalled();
    expect(errorLogger.error).toHaveBeenCalledWith(
      'Error submitting list for analysis',
      expect.objectContaining({
        component: 'ListActions',
        action: 'submitListForAnalysis',
        error: mockError,
        listId: '1',
      })
    );
    expect(setIsListSubmittedForAnalysis).not.toHaveBeenCalled();
    expect(setDraftSubmitDialogOpen).toHaveBeenCalledWith(false);
  });

  it('calls onComplete when ManageListFolderDialog completes successfully', async () => {
    const user = userEvent.setup();
    const setIsManageListFolderOpen = jest.fn();
    const setState = jest.fn();
    const mockFolders = [
      {
        id: 'folder1',
        name: 'Test Folder',
        lists: ['1', '2'],
      },
      {
        id: 'folder2',
        name: 'Another Folder',
        lists: ['3'],
      },
    ];

    getFolders.mockResolvedValue(mockFolders);
    updateFolders.mockReturnValue({ type: 'UPDATE_FOLDERS', payload: mockFolders });

    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ListActions
            currentUser={currentUser}
            selectedList={mockStore.selectedLists[0]}
            userSharedLists={[]}
            isInFolder={false}
            isManageListFolderOpen={true}
            setIsManageListFolderOpen={setIsManageListFolderOpen}
            setState={setState}
            showShareList={mockFunction}
            handleDraftSubmit={mockFunction}
            draftSubmitDialogOpen={false}
            setDraftSubmitDialogOpen={mockFunction}
            setIsListSubmittedForAnalysis={mockFunction}
            isListSubmittedForAnalysis={false}
            toggleReRunAnalysisDialog={mockFunction}
            rerunDialogState={false}
            rerunList={mockFunction}
            showMultipleSelectionBulkActions={false}
            canMove={false}
            canDelete={false}
            folders={mockFolders}
          />
        </ThemeProvider>
      </Provider>
    );

    const manageDialog = screen.getByTestId('manage-list-folder-dialog');
    expect(manageDialog).toBeInTheDocument();

    const completeButton = screen.getByText('Complete');
    await user.click(completeButton);

    await waitFor(() => {
      expect(getFolders).toHaveBeenCalled();
    });

    expect(updateFolders).toHaveBeenCalledWith(mockFolders);

    expect(storeDispatchSpy).toHaveBeenCalledWith({
      type: 'UPDATE_FOLDERS',
      payload: mockFolders,
    });

    // Verify setState was called with the expected state
    // currentFolder should be the folder that contains the list (id='1')
    expect(setState).toHaveBeenCalledWith({
      bannerContent: 'List added to folder successfully',
      isManageListFolderOpen: false,
      currentFolder: mockFolders[0], // folder1 contains list '1'
    });
  });
});
