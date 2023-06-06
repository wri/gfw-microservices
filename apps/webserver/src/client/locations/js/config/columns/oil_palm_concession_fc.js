import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import { checkValid } from '../../utils/locationsTableUtils';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const renderCell = (label) => {
  return checkValid(label) ? <span title={label}>{label}</span> : '--';
};

const oil_palm_concession_fc = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.company} />,
    accessor: 'Company',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
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
];

export default oil_palm_concession_fc;
