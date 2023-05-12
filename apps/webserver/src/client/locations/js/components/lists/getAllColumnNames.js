import cloneDeep from 'lodash/cloneDeep';
import { GFWLists } from '../../config/listNames';
import columns from '../../config/columns';
import { getListColumns } from './getListColumns';

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
  const { custom_attribute_names } = selectedLists[0];

  columnNames.list = getListColumns(locationData, custom_attribute_names, selectedLists);
  if (listView === 'forest_change') {
    columnNames.required = cloneDeep(columns.forest_change_locations);
    if (GFWLists.includes(list_name)) {
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
  } else if (listView === 'policy') {
    columnNames.required = columns.policy_locations.slice();
  }
  if (list_name === 'Palm Oil Mills') {
    if (listView === 'forest_change') {
      gfwColumns.push(...columns.palm_oil_mill_fc.slice());
    } else if (listView === 'commodity_risk') {
      gfwColumns.push(...columns.palm_oil_mill_cr.slice());
    }
  } else if (
    selectedLists.length > 0 &&
    (list_name === 'RSPO Palm Concessions' || list_name === 'Oil Palm Concessions') &&
    listView === 'forest_change'
  ) {
    gfwColumns.push(...columns.oil_palm_concession_fc.slice());
  } else if (list_name === 'Protected Areas' && listView === 'forest_change') {
    gfwColumns.push(...columns.protected_area_fc.slice());
  }

  const checkbox = getCheckboxColumn();
  const [site_id] = cloneDeep(columns.location_id);
  const [location_name] = cloneDeep(columns.react_table__location_name);
  const columnNamesCloneFiltered = cloneDeep(columnNames.list).filter(
    (column) => column.Header !== location_name.Header
  );
  columnNames.list = [...columnNamesCloneFiltered, site_id];
  if (listView === 'forest_change') {

    const { columns: forestChangeAnalysisColumns, ...forestChangeAnalysisRestOfProperties } =
      columns.forest_change_analysis[1];

    let notSortableColumns;
    if (!GFWLists.includes(list_name)) {
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
  } else if (listView === 'policy') {
    const analysis = columns.policy_analysis.slice();
    columnNames.combinedColumns = [
      checkbox,
      location_name,
      ...columnNames.required,
      ...analysis,
      ...gfwColumns,
      ...columnNames.list,
    ];
  } else if (listView === 'commodity_risk') {
    const analysis = columns.commodity_analysis.slice();
    columnNames.combinedColumns = [checkbox, location_name, ...analysis, ...gfwColumns, ...columnNames.list];
  }

  return columnNames;
};

export default getAllColumnNames;
