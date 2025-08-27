import filterListData from './filterListData';
import store from '../../../../locations/js/store';
import { updateFilteredData } from '../../../../locations/js/actions/locationActions';

jest.mock('../../../../locations/js/store', () => ({
  dispatch: jest.fn(),
}));
jest.mock('../../../../locations/js/actions/locationActions', () => ({
  updateFilteredData: jest.fn((ids) => ({ type: 'UPDATE_FILTERED_DATA', payload: ids })),
}));
jest.mock('../../../../locations/js/utils/locationsTableUtils', () => ({
  checkValid: jest.fn(() => true),
  getLastValue: jest.fn(() => 1),
}));
global.gtag = jest.fn();

describe('filterListData', () => {
  const mockListData = [
    {
      location_id: 1,
      Country: 'Brazil',
      State: 'Amazonas',
      'Sub State': 'North',
      'Parent Company': 'CompanyA',
      'Supplier Name': 'SupplierX',
      'Second Supplier Name': 'SupplierY',
      total_area: 100,
      'Analysis Area': 50,
      tree_cover_extent_total: 30,
      tree_cover_loss_total_yearly: 5,
      tree_cover_loss_protected_areas_yearly: 2,
      tree_cover_loss_primary_forest_yearly: 1,
      Certification: ['RSPO'],
      commodity_mill_priority_level: 'priority',
      commodity_threat_overall_level: 'threat',
      commodity_value_overall_level: 'value',
      'Location Name': 'Loc1',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getAdministrativeAreasData when selected list is Administrative Areas', () => {
    const getAdmin = jest.fn();
    const getProtected = jest.fn();

    filterListData(
      mockListData,
      { someFilter: 'x' },
      { list_name: 'Administrative Areas', id: 123 },
      getAdmin,
      getProtected
    );

    expect(getAdmin).toHaveBeenCalledWith({ filters: { someFilter: 'x' }, id: 123, page: 0 });
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('calls getProtectedAreasData when selected list is Protected Areas', () => {
    const getAdmin = jest.fn();
    const getProtected = jest.fn();

    filterListData(
      mockListData,
      { someFilter: 'x' },
      { list_name: 'Protected Areas', id: 456 },
      getAdmin,
      getProtected
    );

    expect(getProtected).toHaveBeenCalledWith({ filters: { someFilter: 'x' }, id: 456, page: 0 });
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches filtered data when filters applied (example: country)', () => {
    filterListData(
      mockListData,
      { selectedCountry: 'Brazil' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters out items if condition not matched', () => {
    filterListData(
      mockListData,
      { selectedCountry: 'Argentina' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([]));
  });

  it('dispatches all IDs when no filters provided', () => {
    filterListData(mockListData, {}, { list_name: 'Other', id: 1 }, jest.fn(), jest.fn());

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('applies tree cover extent filter correctly', () => {
    filterListData(
      mockListData,
      { showTreeCoverExtent: true, treeCoverExtentMin: 50, treeCoverExtentMax: 70 },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('calls gtag after execution', () => {
    filterListData(mockListData, {}, { list_name: 'Other', id: 1 }, jest.fn(), jest.fn());

    expect(global.gtag).toHaveBeenCalledWith('event', 'list table filter', expect.any(Object));
  });
});
