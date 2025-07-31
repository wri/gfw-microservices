import { render } from '@testing-library/react';
import WrappedReactTable from './WrappedReactTable';
import ReactTable from 'react-table';
import columns from '../../../config/columns';

// Mock ReactTable to avoid rendering the actual table
jest.mock('react-table', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

global.Transifex = {
  live: {
    translateText: jest.fn((text) => text),
  },
};

// Mock store
jest.mock('../../../../../locations/js/store', () => ({
  getState: jest.fn(() => ({
    naturalForestLossDataSource: 'SBTN_NATURAL_FOREST_LOSS',
    deforestationDisplayFormat: 'DISPLAY_FORMAT_PERCENTAGE',
  })),
}));

describe('WrappedReactTable', () => {
  const mockFilteredLists = [
    {
      id: 1,
      location_status_id: 'active',
      natural_land_deforested_area: 100,
      naturalForestLossPercent: 10,
      jrc_land_deforested_area: 200,
      jrcNaturalForestLossPercent: 20,
      protected_areas_area: 300,
      protectedAreasPercent: 30,
      landmark_area: 400,
      landmarkPercent: 40,
    },
  ];

  const mockColumns = [{ accessor: 'checkbox', show: true }, ...columns.post_2020_risk];

  const defaultProps = {
    listId: 'list-1',
    listView: 'grid',
    isUserList: false,
    page: 0,
    listColumns: mockColumns,
    combinedColumns: mockColumns,
    visibleColumns: mockColumns.map((col) => col.accessor),
    filteredLists: mockFilteredLists,
    numberOfPages: 1,
    tableSortedBy: 'id',
    tableSortedDesc: false,
    getUserLocationData: jest.fn(),
    getFilteredGfwListData: jest.fn(),
    setSortedBy: jest.fn(),
    isGfwList: false,
    isSharedList: false,
    viewDiagnostic: jest.fn(),
    isDeleteButtonAvailable: false,
    promptDeleteSelectedLocations: jest.fn(),
    isEditActionAvailable: false,
    copyMoveAction: jest.fn(),
    isCopyMoveActionAvailable: false,
    selectedList: null,
    setIsLoading: jest.fn(),
    currentUser: { id: 1 },
  };

  it('renders correctly with initial props', () => {
    render(<WrappedReactTable {...defaultProps} />);

    // Check if ReactTable is rendered
    expect(ReactTable).toHaveBeenCalled();

    // Verify ReactTable props
    const reactTableProps = ReactTable.mock.calls[0][0];
    expect(reactTableProps.data).toEqual(mockFilteredLists);
    expect(reactTableProps.columns).toEqual(mockColumns);
    expect(reactTableProps.defaultPageSize).toBe(50);
    expect(reactTableProps.showPagination).toBe(true);
    expect(reactTableProps.manual).toBe(true);
    expect(reactTableProps.pages).toBe(1);
    expect(reactTableProps.page).toBe(0);
  });

  it('toggles column visibility based on store state', () => {
    render(<WrappedReactTable {...defaultProps} />);
    const { columns } = ReactTable.mock.calls[0][0];

    // Verify column visibility based on store state
    const naturalLandColumn = columns.find(
      (col) => col.accessor === 'natural_land_deforested_area'
    );
    expect(naturalLandColumn.show).toBe(false);

    const naturalForestLossPercentColumn = columns.find(
      (col) => col.accessor === 'naturalForestLossPercent'
    );
    expect(naturalForestLossPercentColumn.show).toBe(true);

    const jrcLandColumn = columns.find((col) => col.accessor === 'jrc_land_deforested_area');
    expect(jrcLandColumn.show).toBe(false);

    const jrcNaturalForestLossPercentColumn = columns.find(
      (col) => col.accessor === 'jrcNaturalForestLossPercent'
    );
    expect(jrcNaturalForestLossPercentColumn.show).toBe(false);

    const protectedAreasColumn = columns.find((col) => col.accessor === 'protected_areas_area');
    expect(protectedAreasColumn.show).toBe(false);

    const protectedAreasPercentColumn = columns.find(
      (col) => col.accessor === 'protectedAreasPercent'
    );
    expect(protectedAreasPercentColumn.show).toBe(true);

    const landmarkColumn = columns.find((col) => col.accessor === 'landmark_area');
    expect(landmarkColumn.show).toBe(false);

    const landmarkPercentColumn = columns.find((col) => col.accessor === 'landmarkPercent');
    expect(landmarkPercentColumn.show).toBe(true);
  });

  // Only override show property if the column doesn't have its own show logic
  // and it's in the toggleable columns list
  it('does not change column.show if it has a getter and is in visibleColumns', () => {
    // Create a column with a getter for 'show'
    const columnWithGetter = {
      accessor: 'custom_accessor',
      get show() {
        return 'getter-value';
      },
    };
    const props = {
      ...defaultProps,
      listColumns: [columnWithGetter],
      combinedColumns: [columnWithGetter],
      visibleColumns: ['custom_accessor'],
    };

    render(<WrappedReactTable {...props} />);
    const { columns } = ReactTable.mock.calls[0][0];

    // The column should retain its getter value, not be overridden
    const col = columns.find((c) => c.accessor === 'custom_accessor');
    expect(Object.getOwnPropertyDescriptor(col, 'show')?.get).toBeDefined();
    expect(col.show).toBe('getter-value');
  });
  // Only override show property if the column doesn't have its own show logic
  // and it's in the toggleable columns list
  it('only changes column.show if it does not have its own show logic and is in visibleColumns', () => {
    const columnWithoutGetter = {
      accessor: 'plain_accessor',
      show: false,
    };
    const props = {
      ...defaultProps,
      listColumns: [columnWithoutGetter],
      combinedColumns: [columnWithoutGetter],
      visibleColumns: ['plain_accessor'],
    };

    render(<WrappedReactTable {...props} />);
    const { columns } = ReactTable.mock.calls[0][0];

    // The column.show should be overridden to true since it's in visibleColumns
    const col = columns.find((c) => c.accessor === 'plain_accessor');
    expect(Object.getOwnPropertyDescriptor(col, 'show')?.get).toBeUndefined();
    expect(col.show).toBe(true);
  });
});
