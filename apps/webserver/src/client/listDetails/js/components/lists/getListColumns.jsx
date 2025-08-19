import {
  checkValid,
  formatDigit,
  sortByDate,
  sortByNone,
} from '../../../../locations/js/utils/locationsTableUtils';
import {
  isDownloadDisabledForThisList,
  findArrIndex,
} from '../../../../locations/js/utils/lists.utils';
import id_type_columns from '../../config/columns/id_type_columns';

const transifex = Transifex.live.translateText;

// Set columns that can be added/removed
export const getListColumns = (locationData, customAttributes, selectedLists) => {
  const columnNames = [];
  const listHiddenColumns = ['version', 'attributes'];
  const priorities = ['high', 'medium', 'low', ''];
  const isListExcluded = isDownloadDisabledForThisList(selectedLists[0]);

  if (locationData) {
    const columnData = Object.keys(locationData);
    // preserves the order of the file
    id_type_columns.forEach((col) => {
      if (columnData.includes(col.accessor)) {
        columnNames.push(col);
      }
    });

    columnData.forEach((key) => {
      const keyIndex = findArrIndex(columnNames, 'accessor', key);
      if (id_type_columns.map((col) => col.accessor).includes(key)) {
        // Already handled above, skip to avoid duplicates
        return;
      }
      if (key === 'Risk Level') {
        columnNames.push({
          Header: (
            <span className="title-text" title={transifex(key)}>
              {transifex(key)}
            </span>
          ),
          accessor: transifex(key),
          show: false,
          Cell: (row) =>
            checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--',
          sortMethod: (a, b) => {
            const first = priorities.indexOf(a.toLowerCase());
            const second = priorities.indexOf(b.toLowerCase());
            return first - second;
          },
        });
      } else if (key === 'State' || key === 'Sub State' || key === 'Country') {
        const index = findArrIndex(columnNames, 'accessor', key);
        if (index === -1) {
          columnNames.push({
            Header: (
              <span className="title-text" title={transifex(key)}>
                {transifex(key)}
              </span>
            ),
            accessor: transifex(key),
            show: false,
            Cell: (row) =>
              checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--',
            sortMethod: sortByNone,
          });
        }
      } else if (key === 'Latitude' || key === 'Longitude') {
        const index = findArrIndex(columnNames, 'accessor', key);
        if (index === -1 && !isListExcluded) {
          columnNames.push({
            Header: (
              <span className="title-text" title={transifex(key)}>
                {transifex(key)}
              </span>
            ),
            accessor: transifex(key),
            show: false,
            Cell: (row) =>
              checkValid(row.value) ? (
                <span title={row.value.toFixed(3)}>{row.value.toFixed(3)}</span>
              ) : (
                '--'
              ),
            sortMethod: sortByNone,
          });
        }
      } else if (key === 'Owner ID' || key === 'Company ID') {
        const index = columnNames.findIndex((v) => v.accessor === key);
        if (index === -1) {
          columnNames.push({
            Header: (
              <span className="title-text" title={transifex(key)}>
                {transifex(key)}
              </span>
            ),
            accessor: transifex(key),
            show: false,
            Cell: (row) =>
              checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--',
            sortMethod: sortByNone,
          });
        }
      } else if (key === 'Start Date' || key === 'End Date') {
        const index = findArrIndex(columnNames, 'accessor', key);
        if (index === -1) {
          columnNames.push({
            Header: (
              <span className="title-text" title={transifex(key)}>
                {transifex(key)}
              </span>
            ),
            accessor: transifex(key),
            show: false,
            Cell: (row) =>
              checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--',
            sortMethod: sortByDate,
          });
        }
      } else if (
        keyIndex === -1 &&
        key !== 'Size' &&
        key !== 'locationName' &&
        key !== 'Location Name' &&
        !key.includes('flag') &&
        !key.includes('_')
      ) {
        columnNames.push({
          Header: (
            <span className="title-text" title={transifex(key)}>
              {transifex(key)}
            </span>
          ),
          accessor: transifex(key),
          show: false,
          Cell: (row) =>
            checkValid(row.value) ? (
              <span title={formatDigit(row.value)}>{formatDigit(row.value)}</span>
            ) : (
              '--'
            ),
        });
      } else if (keyIndex === -1 && customAttributes && customAttributes.indexOf(key) > -1) {
        columnNames.push({
          Header: transifex(key),
          accessor: transifex(key),
          show: false,
          className: 'td-num',
          Cell: (row) =>
            checkValid(row.value) ? (
              <span title={formatDigit(row.value)}>{formatDigit(row.value)}</span>
            ) : (
              '--'
            ),
        });
      }
    });
  }

  return columnNames.filter((col) => !listHiddenColumns.includes(col.accessor));
};
