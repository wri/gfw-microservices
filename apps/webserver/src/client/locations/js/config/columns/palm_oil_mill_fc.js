import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import { checkValid } from '../../utils/locationsTableUtils';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const renderCell = (row) => {
  return checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--';
}

const palm_oil_mill_fc = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.parentCompany} />,
    accessor: 'Parent Company',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.certification} />,
    accessor: 'Certification',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.rspoModel} />,
    accessor: 'RSPO Model',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.id} />,
    accessor: 'Mill ID',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.alternativeMill} />,
    accessor: 'Alternative Name',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
];

export default palm_oil_mill_fc;
