import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import { checkValid, sortAlphaNum } from '../../utils/locationsTableUtils';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const transifex = Transifex.live.translateText;

const policy_locations = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.locationName} />,
    accessor: 'Location Name',
    show: true,
    width: 130,
    maxWidth: 130,
    Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
    sortMethod: sortAlphaNum,
  },
  {
    Header: () => (
      <span className="title-text" title={transifex(columnHeaders.sizeInHa)}>
        {transifex(columnHeaders.size)} <span className="title-text__units">(ha)</span>
      </span>
    ),
    accessor: 'total_area',
    className: 'td-num',
    show: true,
    width: 75,
    maxWidth: 75,
    Cell: (row) =>
      checkValid(row.value) ? <span title={formatDigit(row.value)}>{formatDigit(row.value)}</span> : '--',
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.commodity} />,
    accessor: 'Commodity',
    show: true,
    width: 100,
    maxWidth: 100,
    Cell: (row) => (checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--'),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.certified} />,
    accessor: 'Certified',
    show: true,
    width: 100,
    maxWidth: 100,
    Cell: (row) =>
      checkValid(row.value) ? (
        row.original.Certification.toLowerCase() === 'yes' ? (
          transifex(row.original.Certification)
        ) : (
          <div className="list-icons-container">
            <svg className="list-icons">
              <use className="analysis-header-click" xlinkHref="#shape-close" />
            </svg>
          </div>
        )
      ) : (
        '--'
      ),
  },
];

export default policy_locations;