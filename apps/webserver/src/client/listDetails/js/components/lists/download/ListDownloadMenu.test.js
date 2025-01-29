import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ListDownloadMenu from './ListDownloadMenu';
import { userAccessLevel } from '../../../../../common/js/config';
import { isDownloadDisabledForThisList } from '../../../../../locations/js/utils/lists.utils';
import downloadRequest from '../../../../../locations/js/components/lists/download/downloadRequest';
import { ThemeProvider } from '../../../../../styles/ThemeProvider';

// Mock the dependencies
jest.mock('@mui/icons-material', () => ({
  Download: () => 'DownloadIcon',
  ExpandMore: () => 'ExpandMoreIcon',
  ExpandLess: () => 'ExpandLessIcon',
}));

jest.mock('../../../../../common/js/config', () => ({
  userAccessLevel: {
    VIEWER: 1,
    EDITOR: 2,
    ADMIN: 3,
  },
}));

jest.mock('../../../../../locations/js/utils/lists.utils', () => ({
  isDownloadDisabledForThisList: jest.fn(),
}));

jest.mock('../../../../../locations/js/components/lists/download/downloadRequest', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../../../locations/js/components/lists/download/confirmDialog', () => ({
  __esModule: true,
  default: jest.fn(() => <div>ConfirmDialog</div>),
}));

jest.mock('material-ui', () => ({
  Menu: ({ children }) => <div>{children}</div>,
  MenuItem: ({ children }) => <div>{children}</div>,
  Popover: ({ children }) => <div>{children}</div>,
}));

describe('ListDownloadMenu', () => {
  const defaultProps = {
    combinedColumns: [],
    currentUser: { access_level_id: userAccessLevel.ADMIN },
    filters: {},
    isLoading: jest.fn(),
    listFilterStr: '',
    listID: 123,
    selectedList: { list_name: 'ListName' },
    tableSortedBy: '',
    selectedLocations: [],
    tableSortedDesc: false,
    listView: 'grid',
    allLocationsSelected: false,
    isGfwList: false,
    isHoverMenu: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the download button when isHoverMenu is false', () => {
    render(<ListDownloadMenu {...defaultProps} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
  });
  /*
  it('renders the menu item when isHoverMenu is true', () => {
    render(<ListDownloadMenu {...defaultProps} isHoverMenu={true} />);
    expect(screen.getByText('DOWNLOAD')).toBeInTheDocument();
  });

  it('opens the popover when the button is clicked', () => {
    render(<ListDownloadMenu {...defaultProps} />);
    const button = screen.getByText('Download');
    fireEvent.click(button);
    expect(screen.getByText('Location(s) CSV')).toBeInTheDocument();
    expect(screen.getByText('Location(s) Shapefile')).toBeInTheDocument();
  });

  it('calls handleMenuClick with the correct parameters when a menu item is clicked', async () => {
    render(<ListDownloadMenu {...defaultProps} />);
    const button = screen.getByText('Download');
    fireEvent.click(button);

    const csvMenuItem = screen.getByText('Location(s) CSV');
    fireEvent.click(csvMenuItem);

    expect(downloadRequest).toHaveBeenCalledWith({
      listID: '123',
      format: 'csv',
      type: 'input',
      filters: {},
      listFilterStr: '',
      tableSortedBy: '',
      tableSortedDesc: false,
      combinedColumns: [],
      selectedLocations: [],
      allLocationsSelected: false,
      listView: 'grid',
      isGfwList: false,
    });
  });

  it('does not render the download options if download is disabled', () => {
    isDownloadDisabledForThisList.mockReturnValue(true);
    render(<ListDownloadMenu {...defaultProps} />);
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  it('does not render the download options if the user is a viewer and the list is not a GFW list', () => {
    const props = {
      ...defaultProps,
      currentUser: { access_level_id: userAccessLevel.VIEWER },
      isGfwList: false,
    };
    render(<ListDownloadMenu {...props} />);
    expect(screen.queryByText('Location(s) CSV')).not.toBeInTheDocument();
    expect(screen.queryByText('Location(s) Shapefile')).not.toBeInTheDocument();
  });

  it('renders the ConfirmDialog when dialogOpen is true', () => {
    render(<ListDownloadMenu {...defaultProps} />);
    const button = screen.getByText('Download');
    fireEvent.click(button);

    const csvMenuItem = screen.getByText('Location(s) CSV');
    fireEvent.click(csvMenuItem);

    expect(screen.getByText('ConfirmDialog')).toBeInTheDocument();
  });
  */
});
