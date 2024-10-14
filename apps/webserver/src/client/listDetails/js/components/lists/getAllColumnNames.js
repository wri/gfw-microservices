import cloneDeep from 'lodash/cloneDeep';
import columns from '../../config/columns';
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
const getAllColumnNames = (listView, locationData, selectedLists, getCheckboxColumn) => {
  const columnNames = {};
  const gfwColumns = [];
  const list_name = selectedLists.length && selectedLists[0].list_name;
  const { custom_attribute_names, isGlobalForestWatchList } = selectedLists[0];

  columnNames.list = getListColumns(locationData, custom_attribute_names, selectedLists);
  if (listView === FOREST_CHANGE_VIEW) {
    columnNames.required = cloneDeep(columns.forest_change_locations);
    if (isGlobalForestWatchList) {
      columnNames.required.map((n) => {
        if (n.accessor === 'total_area') {
          switch (list_name) {
            case 'RSPO Palm Concessions':
            case 'Oil Palm Concessions':
              n.accessor = 'Analysis Area';
              break;
            default:
              n.accessor = 'Size';
          }
        }
        return n;
      });
    }
  }
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

  const checkbox = getCheckboxColumn();
  const [site_id] = cloneDeep(columns.location_id);
  const [location_name] = cloneDeep(columns.react_table__location_name);
  const columnNamesCloneFiltered = cloneDeep(columnNames.list).filter(
    (column) => column.Header !== location_name.Header
  );
  columnNames.list = [...columnNamesCloneFiltered, site_id];
  if (listView === FOREST_CHANGE_VIEW) {
    const { columns: forestChangeAnalysisColumns, ...forestChangeAnalysisRestOfProperties } =
      columns.forest_change_analysis[1];

    let notSortableColumns;
    if (!isGlobalForestWatchList) {
      notSortableColumns = forestChangeAnalysisColumns.map((col) => {
        return {
          ...col,
          sortable: false,
        };
      });
    }

    const analysis = [
      columns.forest_change_analysis[0],
      {
        ...(notSortableColumns
          ? { columns: notSortableColumns, ...forestChangeAnalysisRestOfProperties }
          : columns.forest_change_analysis[1]),
      },
    ];

    columnNames.combinedColumns = [
      checkbox,
      location_name,
      ...columnNames.required,
      ...analysis,
      ...gfwColumns,
      ...columnNames.list,
    ];
  } else if (listView === COMMODITY_RISK_VIEW) {
    const analysis = columns.commodity_analysis.slice();
    columnNames.combinedColumns = [
      checkbox,
      location_name,
      ...analysis,
      ...gfwColumns,
      ...columnNames.list,
    ];
  } else if (listView === POST_2020_RISK_ASSESSMENT_VIEW) {
    const analysis = columns.post_2020_risk.slice();
    columnNames.combinedColumns = [checkbox, ...analysis];
  }

  return columnNames;
};

export default getAllColumnNames;
