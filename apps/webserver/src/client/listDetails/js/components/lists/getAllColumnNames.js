import cloneDeep from 'lodash/cloneDeep';
import columns from '../../config/columns';
import gfwListsSizeColumn from './gfwListsSizeColumn';
import { getListColumns } from './getListColumns';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
} from './ListDetails/listViews.constants';

/**
 * Get all column names based on List view name and location data
 * @param {String} listView - List view name
 * @param {Object} locationData - Selected location data Object
 * @returns {Object} columnNames - Return data based on selected list
 */
const getAllColumnNames = (
  listView,
  locationData,
  selectedLists,
  getCheckboxColumn,
  areAllAnalysesDraft = false
) => {
  const columnNames = {};
  const gfwColumns = [];
  const list_name = selectedLists.length && selectedLists[0].list_name;
  const listId = selectedLists[0]?.id;
  const { custom_attribute_names, isGlobalForestWatchList } = selectedLists[0];

  // All existing columns for this list based on locationData
  const allListColumns = getListColumns(locationData, custom_attribute_names, selectedLists);

  // Always required
  const checkbox = getCheckboxColumn();
  const [site_id] = cloneDeep(columns.location_id);
  const [location_name] = cloneDeep(columns.react_table__location_name);

  const defaultShownColumns = [checkbox, location_name];

  // Remove location_name from allListColumns (will be added explicitly)
  const filteredListColumns = cloneDeep(allListColumns).filter(
    (column) => column.Header !== location_name.Header
  );

  columnNames.list = [...filteredListColumns, site_id];

  if (list_name === 'Palm Oil Mills') {
    if (listView === FOREST_CHANGE_VIEW) {
      gfwColumns.push(...columns.palm_oil_mill_fc.slice());
    } else if (listView === COMMODITY_RISK_VIEW) {
      gfwColumns.push(...columns.palm_oil_mill_cr.slice());
    }
  } else if (
    selectedLists.length > 0 &&
    (list_name === 'RSPO Palm Concessions' || list_name === 'Oil Palm Concessions') &&
    listView === FOREST_CHANGE_VIEW
  ) {
    gfwColumns.push(...columns.oil_palm_concession_fc.slice());
  } else if (list_name === 'Protected Areas' && listView === FOREST_CHANGE_VIEW) {
    gfwColumns.push(...columns.protected_area_fc.slice());
  }

  if (areAllAnalysesDraft) {
    columnNames.combinedColumns = [
      ...defaultShownColumns,
      ...columns.draft_state_columns.slice(),
      ...columnNames.list,
    ];
  } else if (listView === FOREST_CHANGE_VIEW) {
    const { columns: forestChangeAnalysisColumns, ...forestChangeAnalysisRestOfProperties } =
      columns.forest_change_analysis[1];

    const notSortableColumns = forestChangeAnalysisColumns.map((col) => {
      return {
        ...col,
        sortable: false,
      };
    });

    const analysis = [
      columns.forest_change_analysis[0],
      {
        ...(notSortableColumns
          ? { columns: notSortableColumns, ...forestChangeAnalysisRestOfProperties }
          : columns.forest_change_analysis[1]),
      },
    ];

    columnNames.combinedColumns = [
      ...defaultShownColumns,
      ...(isGlobalForestWatchList ? gfwListsSizeColumn(listId) : []),
      ...analysis,
      ...gfwColumns,
      ...columnNames.list,
    ];
  } else if (listView === COMMODITY_RISK_VIEW) {
    const analysis = columns.commodity_analysis.slice();
    columnNames.combinedColumns = [
      ...defaultShownColumns,
      ...analysis,
      ...gfwColumns,
      ...columnNames.list,
    ];
  } else if (listView === POST_2020_RISK_ASSESSMENT_VIEW) {
    const analysis = columns.post_2020_risk.slice();
    columnNames.combinedColumns = [checkbox, ...analysis, ...columnNames.list];
  }

  return columnNames;
};

export default getAllColumnNames;
