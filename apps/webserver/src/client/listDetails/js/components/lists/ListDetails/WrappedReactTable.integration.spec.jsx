import { render, screen, fireEvent, within } from '@testing-library/react';
import WrappedReactTable from './WrappedReactTable';
import columns from '../../../config/columns';

global.Transifex = {
  live: {
    translateText: jest.fn((t) => t),
    onAfterTranslate: jest.fn(),
    off: jest.fn(),
    getSelectedLanguageCode: jest.fn(() => 'en'),
  },
};
global.gtag = jest.fn();

jest.mock('../../../../../locations/js/store', () => ({
  getState: jest.fn(() => ({})),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
}));

describe('WrappedReactTable integration (real react-table)', () => {
  const baseColumns = [
    { accessor: 'checkbox', id: 'checkbox', sortable: false, show: true, Header: () => 'cb' },
    ...columns.post_2020_risk,
  ];

  const props = {
    listId: 'list-1',
    listView: 'grid',
    isUserList: true,
    page: 0,
    listColumns: baseColumns,
    combinedColumns: baseColumns,
    visibleColumns: baseColumns.map((c) => c.accessor),
    filteredLists: [{ location_id: 1, 'Location Name': 'a', total_area_ha: 5 }],
    numberOfPages: 1,
    tableSortedBy: 'Location Name',
    tableSortedDesc: false,
    getUserLocationData: jest.fn(),
    getFilteredGfwListData: jest.fn(),
    setSortedBy: jest.fn(),
    isGfwList: false,
    isSharedList: false,
    viewDiagnostic: jest.fn(),
    isDeleteButtonAvailable: false,
    promptDeleteSelectedLocations: jest.fn(),
    copyMoveAction: jest.fn(),
    isCopyMoveActionAvailable: false,
    selectedList: {},
    setIsLoading: jest.fn(),
    currentUser: {},
  };

  it('renders and re-renders without crashing or looping', () => {
    const { rerender } = render(<WrappedReactTable {...props} />);
    // simulate a sort change re-render
    rerender(<WrappedReactTable {...props} tableSortedBy="total_area_ha" tableSortedDesc />);
    rerender(
      <WrappedReactTable {...props} tableSortedBy="total_area_ha" tableSortedDesc={false} />
    );
    expect(true).toBe(true);
  });

  it('opens the shared sort menu from a header trigger and applies a sort', () => {
    const setSortedBy = jest.fn();
    const { container } = render(<WrappedReactTable {...props} setSortedBy={setSortedBy} />);

    const [trigger] = container.querySelectorAll('.sortable-column-header__trigger');
    expect(trigger).toBeTruthy();
    fireEvent.click(trigger);

    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Sort by')).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole('menuitem', { name: /descending/i }));
    expect(setSortedBy).toHaveBeenCalledWith(expect.anything(), true);
  });
});
