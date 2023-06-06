import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import { checkValid } from '../../utils/locationsTableUtils';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const renderCell = (row) => {
  return checkValid(row.value) ? <span title={row.value}>{row.value}</span> : '--';
};

const protected_area_fc = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.iucn} />,
    accessor: 'IUCN CAT',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.designationType} />,
    accessor: 'Designation Type',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.designation} />,
    accessor: 'Designation',
    width: 300,
    maxWidth: 300,
    show: true,
    Cell: (row) => renderCell(row.value),
  },
];

export default protected_area_fc;
