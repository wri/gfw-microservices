import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListDetails from './index';

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

// Mock react-redux
jest.mock('react-redux', () => ({
  connect: () => (Component) => Component,
}));

// Mock global gtag
global.gtag = jest.fn();

// Mock Transifex
global.Transifex = {
  live: {
    onAfterTranslate: jest.fn(),
    off: jest.fn(),
    translateText: jest.fn((text) => text),
  },
};

// Mock LocationsSummary component
jest.mock('./LocationsSummary', () => () => <div data-testid="locations-summary" />);

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
