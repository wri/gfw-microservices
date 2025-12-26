import { render, screen } from '@testing-library/react';
import ListDownloadMenu from './ListDownloadMenu';
import { userAccessLevel } from '../../../../../common/js/config';

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

  it('renders the download button when isHoverMenu is false', () => {
    render(<ListDownloadMenu {...defaultProps} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
  });
});
