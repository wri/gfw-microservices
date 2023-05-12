import React from 'react';
import { checkValid, formatDigit, sortByDate, sortByNone } from '../../utils/locationsTableUtils';
import { isDownloadDisabledForThisList, findArrIndex } from '../../utils/lists.utils';

const transifex = Transifex.live.translateText;

// Set columns that can be added/removed
export const getListColumns = (locationData, customAttributes, selectedLists) => {
  const columnNames = [];
  const priorities = ['high', 'medium', 'low', ''];
  const isListExcluded = isDownloadDisabledForThisList(selectedLists[0]);

  if (locationData) {
    Object.keys(locationData).forEach((key) => {
      const keyIndex = findArrIndex(columnNames, 'accessor', key);
      if (key === 'Risk Level') {
        columnNames.push({
          Header: (
            <span className="title-text" title={transifex(key)}>
              {transifex(key)}
            </span>
          ),
          accessor: key,
          show: false,
          Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
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
            accessor: key,
            show: false,
            Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
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
            accessor: key,
            show: false,
            Cell: (row) =>
              checkValid(row.value) ? <span title={row.value.toFixed(3)}>{row.value.toFixed(3)}</span> : '--',
            sortMethod: sortByNone,
          });
        }
      } else if (key === 'Owner ID' || key === 'Company ID' || key === 'ID') {
        const index = columnNames.findIndex((v) => v.accessor === key);
        if (index === -1) {
          columnNames.push({
            Header: (
              <span className="title-text" title={transifex(key)}>
                {transifex(key)}
              </span>
            ),
            accessor: key,
            show: false,
            Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
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
            accessor: key,
            show: false,
            Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
            sortMethod: sortByDate,
          });
        }
      } else if (
        keyIndex === -1 &&
        key !== 'Size' &&
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
          accessor: key,
          show: false,
          Cell: (row) =>
            checkValid(row.value) ? <span title={formatDigit(row.value)}>{formatDigit(row.value)}</span> : '--',
        });
      } else if (keyIndex === -1 && customAttributes && customAttributes.indexOf(key) > -1) {
        columnNames.push({
          Header: key,
          accessor: key,
          show: false,
          className: 'td-num',
          Cell: (row) =>
            checkValid(row.value) ? <span title={formatDigit(row.value)}>{formatDigit(row.value)}</span> : '--',
        });
      }
    });
  }

  return columnNames;
};
