import { render, cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListDetails from './index';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import { updateSelectedLocations } from '../../../../../locations/js/actions/locationActions';
import { FOREST_CHANGE_VIEW } from './listViews.constants';
import store from '../../../../../locations/js/store';

// Mock componentDidMount to prevent network requests
ListDetails.prototype.componentDidMount = jest.fn();

// Mock axios to prevent network requests
jest.mock('axios', () => {
  const mockAxios = jest.fn().mockResolvedValue({ data: {} });
  mockAxios.post = jest.fn().mockResolvedValue({ data: {} });
  mockAxios.put = jest.fn().mockResolvedValue({});
  mockAxios.get = jest.fn().mockResolvedValue({ data: {} });
  return mockAxios;
});

// Mock global gtag
global.gtag = jest.fn();

// Mock the components used in ListDetails
jest.mock('./AnalysisStatusBanners', () => () => <div data-testid="analysis-status-banners" />);
jest.mock('./ListActions', () => () => <div data-testid="list-actions" />);
jest.mock('./WrappedReactTable', () => () => <div data-testid="wrapped-react-table" />);
jest.mock('./AnalysesTabs', () => () => <div data-testid="analyses-tabs" />);
jest.mock('./GHGBanner', () => {
  const GHGBanner = () => <div data-testid="ghg-banner" />;
  return {
    __esModule: true,
    default: GHGBanner,
  };
});
jest.mock('../LocationDataNotAvailableMessage', () => () => (
  <div data-testid="location-data-not-available" />
));
jest.mock('./LocationsSummary', () => () => <div data-testid="locations-summary" />);
jest.mock('../../../../../locations/js/components/ShareList/ShareList', () => () => (
  <div data-testid="share-list" />
));
jest.mock('material-ui/Dialog', () => () => <div data-testid="dialog" />);
jest.mock('material-ui/Tabs', () => ({ Tabs: () => <div />, Tab: () => <div /> }));
jest.mock('material-ui/Card', () => ({ Card: () => <div />, CardText: () => <div /> }));
jest.mock('material-ui/FlatButton', () => () => <div />);
jest.mock('material-ui/Toolbar', () => ({ Toolbar: () => <div />, ToolbarGroup: () => <div /> }));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('ListDetails', () => {
  const defaultProps = {
    templateData: [],
    userLists: [],
    userSharedLists: [],
    userInfo: { id: 1, access_level_id: 1 },
    currentUser: { id: 1, access_level_id: 1 },
    usersList: [],
    organizationId: 1,
    gfwLists: [],
    listData: [],
    filteredLocationData: [],
    selectedLocations: [],
    selectedLists: [
      {
        id: 1,
        list_name: 'Test List',
        isGlobalForestWatchList: false,
        user_id: 1,
        listAnalysesStatus: [],
      },
    ],
    listView: 'forest-change',
    filters: {},
    filterCount: 0,
    filteredData: [],
    addType: '',
    activeTemplate: '',
    canopyModalVisible: false,
    shareView: false,
    isGfwList: false,
    isSharedList: false,
    isInFolder: false,
    canDelete: true,
    userFolders: [],
    isListSubmittedForAnalysis: false,
    isFailedAnalysis: false,
    isAnalysisFailedByExceededAnalysisLimit: false,
    hasLocationWithErrors: false,
    isDiagnosticStatusDraft: false,
    isListWithErrors: false,
  };

  it('renders LocationDataNotAvailableMessage when analysis is failed', () => {
    const props = {
      ...defaultProps,
      selectedLists: [
        {
          id: 1,
          list_name: 'Test List',
          isGlobalForestWatchList: false,
          user_id: 1,
          listAnalysesStatus: [],
          isFailed: true,
        },
      ],
      isListSubmittedForAnalysis: true,
    };

    const { getByTestId } = render(<ListDetails {...props} />);

    // Verify that LocationDataNotAvailableMessage is rendered
    expect(getByTestId('location-data-not-available')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    render(<ListDetails {...defaultProps} />);

    // Verify that some of the mocked components are rendered
    expect(screen.getByTestId('list-actions')).toBeInTheDocument();
    expect(screen.getByTestId('location-data-not-available')).toBeInTheDocument();
    expect(screen.getByTestId('locations-summary')).toBeInTheDocument();
  });

  it('handles different list view states', () => {
    // Render with shareView set to true
    const { rerender } = render(<ListDetails {...defaultProps} shareView={true} />);

    // When shareView is true, we should see the ShareList component
    expect(screen.getByTestId('share-list')).toBeInTheDocument();

    // Re-render with shareView set to false
    rerender(<ListDetails {...defaultProps} shareView={false} />);

    // When shareView is false, we should see the ListActions component
    expect(screen.getByTestId('list-actions')).toBeInTheDocument();
  });

  it('shows warning box when there are locations with errors', () => {
    const props = {
      ...defaultProps,
      selectedLists: [
        {
          id: 1,
          list_name: 'Test List',
          isGlobalForestWatchList: false,
          user_id: 1,
          listAnalysesStatus: [
            {
              analysisId: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
              status: 'active',
            },
          ],
        },
      ],
      listData: [
        {
          id: 1,
          name: 'Test Location',
          ErrorDetails: 'Test error details',
        },
      ],
      listView: FOREST_CHANGE_VIEW,
      listViewOptions: [FOREST_CHANGE_VIEW],
    };

    render(<ListDetails {...props} />);

    expect(screen.getByText(/1 location/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /couldn't be analyzed due to invalid data \(based on the first 50 rows in your list\)\. hover over each failed location in the table to view specific errors\. fix errors offline, re-add locations to your list, and resubmit for analysis\. you can delete previously failed locations if desired\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /more details/i,
      })
    ).toHaveAttribute(
      'href',
      'https://globalforestwatch.org/help/gfw-pro/guides/upload-locations-lists'
    );
  });

  it('updates selected locations when checkbox is clicked', () => {
    // Mock store dispatch
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    // Create props with initial selected locations
    const props = {
      ...defaultProps,
      selectedLocations: [1, 2, 3],
      filteredData: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      filteredLocationData: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      selectedLists: [{ id: 1, isGlobalForestWatchList: false }],
      filterString: '',
    };

    // Create component instance
    const component = new ListDetails(props);

    // Initialize required state
    component.state = {
      combinedColumns: [{ id: 'location_id' }],
    };

    // Test deselecting location 2
    component.setLocationCheckbox(2);

    // Verify store dispatch was called with updated locations
    expect(mockDispatch).toHaveBeenCalledWith(updateSelectedLocations([1, 3]));
  });

  describe('loadLocationView', () => {
    it('calls getAdministrativeAreasInfo for Administrative Areas list', () => {
      const component = new ListDetails({
        selectedLists: [
          {
            list_name: 'Administrative Areas',
          },
        ],
      });

      component.getAdministrativeAreasInfo = jest.fn();
      component.loadLocationView();
      expect(component.getAdministrativeAreasInfo).toHaveBeenCalled();
    });

    it('calls getUserLocationData for user lists', () => {
      const component = new ListDetails({
        selectedLists: [
          {
            list_name: 'Test List',
            isGlobalForestWatchList: false,
            id: 123,
          },
        ],
      });

      component.getUserLocationData = jest.fn();
      component.loadLocationView();
      expect(component.getUserLocationData).toHaveBeenCalledWith(123);
    });

    it('calls getGFWLocationData for GFW lists', () => {
      const component = new ListDetails({
        selectedLists: [
          {
            list_name: 'GFW List',
            isGlobalForestWatchList: true,
            id: 456,
          },
        ],
      });

      component.getGFWLocationData = jest.fn();
      component.loadLocationView();
      expect(component.getGFWLocationData).toHaveBeenCalledWith(456);
    });
  });

  it('displays analysis status correctly', () => {
    // Render with isListSubmittedForAnalysis set to true
    const { rerender } = render(
      <ListDetails {...defaultProps} isListSubmittedForAnalysis={true} />
    );

    // Analysis status banners should be visible
    expect(screen.getByTestId('analysis-status-banners')).toBeInTheDocument();

    // Re-render with isFailedAnalysis set to true
    rerender(<ListDetails {...defaultProps} isFailedAnalysis={true} />);

    // Analysis status banners should still be visible
    expect(screen.getByTestId('analysis-status-banners')).toBeInTheDocument();
  });

  it('does not render GHG banner when isGHGActive is false', () => {
    // Render with isGHGActive explicitly set to false
    render(<ListDetails {...defaultProps} isGHGActive={false} />);

    // GHG banner should not be in the document
    expect(screen.queryByTestId('ghg-banner')).not.toBeInTheDocument();
  });
});
