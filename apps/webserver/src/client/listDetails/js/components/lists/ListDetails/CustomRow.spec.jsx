import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CustomRow from './CustomRow';
import appReducer from '../../../../../locations/js/reducers/appReducer';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';

// Mock actions
jest.mock('../../../../../locations/js/actions/locationActions', () => ({
  updateSelectedLocations: jest.fn(),
}));

// Mock redirectToMap function
jest.mock('../../../../../common/js/utils/redirect', () => jest.fn());

// Create a mock store for testing
const mockStore = createStore(appReducer, {
  naturalForestLossDataSource: 'JRC_NATURAL_FOREST_LOSS', // initial state
});

const rowInfoMock = {
  location_id: '1',
  location_status_id: listStatus.Active,
  statusCode: listStatus.Active,
};

const defaultProps = {
  rowInfo: rowInfoMock,
  isGfwList: true,
  isSharedList: false,
  listId: '123',
  viewDiagnostic: jest.fn(),
  isDeleteButtonAvailable: true,
  promptDeleteSelectedLocations: jest.fn(),
  isEditActionAvailable: true,
  copyMoveAction: jest.fn(),
  isCopyMoveActionAvailable: true,
  selectedList: 'list1',
  listView: 'listView1',
  visibleColumns: [],
  currentUser: 'user1',
  setIsLoading: jest.fn(),
};

describe('CustomRow', () => {
  it('should render the component and handle interactions', async () => {
    render(
      <Provider store={mockStore}>
        <CustomRow {...defaultProps} />
      </Provider>
    );

    const user = userEvent.setup();

    // Simulate hovering over the row to reveal the menu
    const rowElement = screen.getByTestId('custom-row'); // Assuming `data-testid="custom-row"` exists
    await user.hover(rowElement);

    // Verify that the location diagnostic button is rendered after hover
    expect(screen.getByText('Location diagnostic')).toBeInTheDocument();

    // Verify that the Map button is rendered after hover
    expect(screen.getByText('Map')).toBeInTheDocument();

    // Simulate mouse leave to hide the menu
    await user.unhover(rowElement);
  });
});
