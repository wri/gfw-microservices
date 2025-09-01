import getAllColumnNames from './getAllColumnNames';
import { getListColumns } from './getListColumns';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
} from './ListDetails/listViews.constants';

// Mock dependencies
jest.mock('./getListColumns');
jest.mock('./gfwListsSizeColumn', () => jest.fn(() => []));
jest.mock('../../config/columns', () => ({
  location_id: [{ id: 'site_id', accessor: 'site_id' }],
  react_table__location_name: [{ id: 'location_name', accessor: 'location_name' }],
  palm_oil_mill_fc: [{ id: 'palm_fc', accessor: 'palm_fc' }],
  palm_oil_mill_cr: [{ id: 'palm_cr', accessor: 'palm_cr' }],
  oil_palm_concession_fc: [{ id: 'concession_fc', accessor: 'concession_fc' }],
  protected_area_fc: [{ id: 'protected_fc', accessor: 'protected_fc' }],
  draft_state_columns: [{ id: 'draft', accessor: 'draft' }],
  forest_change_analysis: [
    { id: 'fc_analysis_1', accessor: 'fc_analysis_1' },
    {
      columns: [{ id: 'fc_col', accessor: 'fc_col', sortable: true }],
      Header: 'Forest Change',
    },
  ],
  commodity_analysis: [{ id: 'commodity', accessor: 'commodity' }],
  post_2020_risk: [{ id: 'risk_2020', accessor: 'risk_2020' }],
}));

describe('getAllColumnNames', () => {
  const mockGetCheckboxColumn = jest.fn(() => ({ id: 'checkbox', accessor: 'checkbox' }));

  beforeEach(() => {
    jest.clearAllMocks();
    getListColumns.mockReturnValue([
      { id: 'custom1', accessor: 'custom1' },
      { id: 'custom2', accessor: 'custom2' },
    ]);
  });

  it('should return basic column structure', () => {
    const selectedLists = [
      {
        id: 1,
        list_name: 'Test List',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(
      FOREST_CHANGE_VIEW,
      { test: 'data' },
      selectedLists,
      mockGetCheckboxColumn
    );

    expect(result).toHaveProperty('list');
    expect(result).toHaveProperty('combinedColumns');
    expect(getListColumns).toHaveBeenCalledWith({ test: 'data' }, [], selectedLists);
  });

  it('should handle Palm Oil Mills with Forest Change view', () => {
    const selectedLists = [
      {
        id: 1,
        list_name: 'Palm Oil Mills',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(FOREST_CHANGE_VIEW, {}, selectedLists, mockGetCheckboxColumn);

    expect(result.combinedColumns).toBeDefined();
  });

  it('should handle Palm Oil Mills with Commodity Risk view', () => {
    const selectedLists = [
      {
        id: 1,
        list_name: 'Palm Oil Mills',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(COMMODITY_RISK_VIEW, {}, selectedLists, mockGetCheckboxColumn);

    expect(result.combinedColumns).toBeDefined();
  });

  it('should handle RSPO Palm Concessions', () => {
    const selectedLists = [
      {
        id: 1,
        list_name: 'RSPO Palm Concessions',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(FOREST_CHANGE_VIEW, {}, selectedLists, mockGetCheckboxColumn);

    expect(result.combinedColumns).toBeDefined();
  });

  it('should handle Protected Areas', () => {
    const selectedLists = [
      {
        id: 1,
        list_name: 'Protected Areas',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(FOREST_CHANGE_VIEW, {}, selectedLists, mockGetCheckboxColumn);

    expect(result.combinedColumns).toBeDefined();
  });

  it('should handle draft analyses', () => {
    const selectedLists = [
      {
        id: 1,
        list_name: 'Test List',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(
      FOREST_CHANGE_VIEW,
      {},
      selectedLists,
      mockGetCheckboxColumn,
      true // areAllAnalysesDraft = true
    );

    expect(result.combinedColumns).toBeDefined();
  });

  it('should handle Post 2020 Risk Assessment view', () => {
    const selectedLists = [
      {
        id: 1,
        list_name: 'Test List',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(
      POST_2020_RISK_ASSESSMENT_VIEW,
      {},
      selectedLists,
      mockGetCheckboxColumn
    );

    expect(result.combinedColumns).toBeDefined();
  });

  it('should filter out location_name from list columns', () => {
    getListColumns.mockReturnValue([
      { id: 'location_name', accessor: 'location_name' },
      { id: 'custom1', accessor: 'custom1' },
    ]);

    const selectedLists = [
      {
        id: 1,
        list_name: 'Test List',
        custom_attribute_names: [],
        isGlobalForestWatchList: false,
      },
    ];

    const result = getAllColumnNames(FOREST_CHANGE_VIEW, {}, selectedLists, mockGetCheckboxColumn);

    const hasLocationName = result.list.some((col) => col.accessor === 'location_name');
    expect(hasLocationName).toBe(false);
  });
});
