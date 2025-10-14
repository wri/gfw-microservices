import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ListActions from './ListActions';

const theme = createTheme();
const muiTheme = getMuiTheme();

const mockStore = {
  listDetails: {
    deforestationDisplayFormat: 'summary',
    selectedLists: [
      {
        id: '1',
        name: 'Test List',
        isGlobalForestWatchList: false,
        list_locations_count: 5,
        error_file_storage_path: null,
      },
    ],
    userSharedLists: [
      {
        id: '2',
        name: 'Shared List',
        isGlobalForestWatchList: false,
      },
    ],
    rerunDialogState: false,
    isManageListFolderOpen: false,
    draftSubmitDialogOpen: false,
    isListSubmittedForAnalysis: false,
    isInFolder: false,
    folders: [],
    userIsOwner: true,
    searchInputValue: '',
    showMultipleSelectionBulkActions: false,
    isEditActionAvailable: true,
    canMove: true,
    canDelete: true,
    filters: {},
    listFilterStr: '',
    tableSortedBy: '',
    tableSortedDesc: false,
    visibleColumns: [],
    selectedLocations: [],
    listView: 'table',
    isLoading: false,
    isGfwList: false,
    isOnlyGHGActive: false,
    isEveryRowSelected: false,
  },
};

const currentUser = {
  id: '1',
  username: 'testuser',
  access_level_id: 1,
};

// Mock dispatch
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn((selector) => selector(mockStore)),
  useDispatch: () => mockDispatch,
}));

describe('ListActions', () => {
  let store;

  const mockFunction = jest.fn();

  beforeEach(() => {
    store = createStore(() => ({
      ...mockStore,
      selectedLists: [{ id: '1', name: 'Test List' }],
      userFolders: [],
      filters: {},
      tableSortedBy: '',
      tableSortedDesc: false,
      visibleColumns: [],
      selectedLocations: [],
      listView: 'table',
      isLoading: false,
      isGfwList: false,
      isOnlyGHGActive: false,
      isEveryRowSelected: false,
      userIsOwner: false,
      showMultipleSelectionBulkActions: false,
      canMove: false,
      canDelete: false,
    }));
    mockDispatch.mockClear();

    // Mock Transifex if it's not defined
    global.window.Transifex = {
      live: {
        onAfterTranslate: jest.fn(),
      },
    };
  });
  it('renders action buttons correctly', () => {
    render(
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
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
        </MuiThemeProvider>
      </Provider>
    );
    expect(screen.getByText('Add Locations')).toBeInTheDocument();
    expect(screen.getByText('List Map')).toBeInTheDocument();
  });

  it('renders bulk action buttons when multiple selections are made', () => {
    render(
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
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
        </MuiThemeProvider>
      </Provider>
    );

    expect(screen.getByText('Copy/Move')).toBeInTheDocument();

    expect(screen.getByText('Delete')).toBeInTheDocument();

    expect(screen.queryByText('Share')).not.toBeInTheDocument();

    expect(screen.queryByText('Update Analysis')).not.toBeInTheDocument();
  });
});
