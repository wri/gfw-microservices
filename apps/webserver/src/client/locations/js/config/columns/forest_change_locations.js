import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import {
  sortByNone,
  checkValid,
  formatDigit,
  sortByStatus,
  locationIsActive,
} from '../../utils/locationsTableUtils';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const transifex = Transifex.live.translateText;

const forest_change_locations = [
  {
    id: 'total_area',
    Header: () => (
      <span className="title-text" title={transifex('Size in ha')}>
        {transifex('Size')} <span className="title-text__units">{transifex('(ha)')}</span>
      </span>
    ),
    accessor: (d) => {
      return d;
    },
    Cell: (row) => {
      const isValidStatus = locationIsActive(row.value);
      const isValidArea = checkValid(row.value.total_area);

      const formattedArea = isValidArea ? formatDigit(row.value.total_area) : 0;
      return isValidStatus ? formattedArea : '--';
    },
    sortMethod: (a, b) => {
      const sortStatus = sortByStatus(a, b);
      if (sortStatus == 2) {
        return a.total_area - b.total_area;
      }

      return sortStatus;
    },
    className: 'td-num',
    show: true,
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.commodity} />,
    accessor: 'Commodity',
    className: 'default-cell',
    show: true,
    width: 100,
    maxWidth: 100,
    Cell: (row) =>
      checkValid(row.value) ? (
        <span title={transifex(row.value)}>{transifex(row.value)}</span>
      ) : (
        '--'
      ),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.state} />,
    accessor: 'State',
    className: 'cell__State default-cell',
    show: true,
    width: 150,
    maxWidth: 150,
    Cell: (row) =>
      checkValid(row.value) ? (
        <span title={transifex(row.value)}>{transifex(row.value)}</span>
      ) : (
        '--'
      ),
    sortMethod: sortByNone,
  },
];

export default forest_change_locations;
