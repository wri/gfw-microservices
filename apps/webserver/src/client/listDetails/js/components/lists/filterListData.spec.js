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

  it('filters by selectedState correctly', () => {
    filterListData(
      mockListData,
      { selectedState: 'Amazonas' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedSubState correctly', () => {
    filterListData(
      mockListData,
      { selectedSubState: 'North' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedParentCompany correctly', () => {
    filterListData(
      mockListData,
      { selectedParentCompany: 'CompanyA' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedSupplier correctly', () => {
    filterListData(
      mockListData,
      { selectedSupplier: 'SupplierX' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedSecondSupplier correctly', () => {
    filterListData(
      mockListData,
      { selectedSecondSupplier: 'SupplierY' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedAreaMin correctly', () => {
    filterListData(
      mockListData,
      { selectedAreaMin: 50 },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedAreaMax correctly', () => {
    filterListData(
      mockListData,
      { selectedAreaMax: 150 },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by showTreeCoverLoss correctly', () => {
    filterListData(
      mockListData,
      { showTreeCoverLoss: true, treeCoverLossMin: 5, treeCoverLossMax: 15 },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by showTreeCoverLossProtectedAreas correctly', () => {
    filterListData(
      mockListData,
      {
        showTreeCoverLossProtectedAreas: true,
        treeCoverLossProtectedAreasMin: 2,
        treeCoverLossProtectedAreasMax: 8,
      },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by showTreeCoverLossPrimaryForest correctly', () => {
    filterListData(
      mockListData,
      {
        showTreeCoverLossPrimaryForest: true,
        treeCoverLossPrimaryForestMin: 1,
        treeCoverLossPrimaryForestMax: 5,
      },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by showRSPOCertified correctly', () => {
    filterListData(
      mockListData,
      { showRSPOCertified: true },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedMillPriority correctly', () => {
    const { getLastValue } = require('../../../../locations/js/utils/locationsTableUtils');
    getLastValue.mockReturnValue(0);

    filterListData(
      mockListData,
      { selectedMillPriority: ['low'] },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedOverallThreats correctly', () => {
    const { getLastValue } = require('../../../../locations/js/utils/locationsTableUtils');
    getLastValue.mockReturnValue(1);

    filterListData(
      mockListData,
      { selectedOverallThreats: ['medium'] },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedOverallValues correctly', () => {
    const { getLastValue } = require('../../../../locations/js/utils/locationsTableUtils');
    getLastValue.mockReturnValue(2);

    filterListData(
      mockListData,
      { selectedOverallValues: ['high'] },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('filters by selectedNames correctly', () => {
    filterListData(
      mockListData,
      { selectedNames: ['Loc1'] },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('handles empty array filters correctly', () => {
    filterListData(
      mockListData,
      { selectedOverallThreats: [] },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('handles unknown filter keys correctly', () => {
    filterListData(
      mockListData,
      { unknownFilter: 'value' },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('handles multiple filters combined', () => {
    filterListData(
      mockListData,
      {
        selectedCountry: 'Brazil',
        selectedState: 'Amazonas',
        selectedAreaMin: 50,
      },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('excludes items when filters do not match', () => {
    filterListData(
      mockListData,
      {
        selectedCountry: 'Brazil',
        selectedState: 'WrongState',
      },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([]));
  });

  it('handles area filters with no matching items', () => {
    filterListData(
      mockListData,
      { selectedAreaMin: 200 }, // Higher than any area in mock data
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([]));
  });

  it('handles tree cover loss filters with no showTreeCoverLoss flag', () => {
    filterListData(
      mockListData,
      { treeCoverLossMin: 5, treeCoverLossMax: 15 }, // Without showTreeCoverLoss: true
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1])); // Should pass through
  });

  it('handles RSPO filter with false value', () => {
    filterListData(
      mockListData,
      { showRSPOCertified: false },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('handles selectedNames with non-matching names', () => {
    filterListData(
      mockListData,
      { selectedNames: ['NonExistentLocation'] },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([]));
  });

  it('handles priority filters with non-matching values', () => {
    const { getLastValue } = require('../../../../locations/js/utils/locationsTableUtils');
    getLastValue.mockReturnValue(3); // Value not in selectedMillPriority

    filterListData(
      mockListData,
      { selectedMillPriority: ['low'] }, // 0 in priority mapping
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([]));
  });

  it('handles null/undefined filter values', () => {
    filterListData(
      mockListData,
      {
        selectedCountry: null,
        selectedState: undefined,
        selectedAreaMin: null,
      },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });

  it('handles empty string filters', () => {
    filterListData(
      mockListData,
      {
        selectedCountry: '',
        selectedState: '',
        selectedParentCompany: '',
      },
      { list_name: 'Other', id: 1 },
      jest.fn(),
      jest.fn()
    );

    expect(store.dispatch).toHaveBeenCalledWith(updateFilteredData([1]));
  });
});
