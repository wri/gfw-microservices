import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import { checkValid } from '../../utils/locationsTableUtils';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const renderCell = (label) => {
  return checkValid(label) ? <span title={label}>{label}</span> : '--'
}

const commodity_locations = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.rspo} />,
    accessor: 'Certification',
    show: true,
    width: 75,
    maxWidth: 75,
    Cell: (row) =>
      checkValid(row.value) && row.value.includes('RSPO') ? (
        <div className="list-icons-container black">
          <svg className="list-icons">
            <use className="analysis-header-click" xlinkHref="#rspo-check" />
          </svg>
        </div>
      ) : (
        '--'
      ),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.parentCompany} />,
    accessor: 'Parent Company',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.supplier} />,
    accessor: 'Supplier Name',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
  {
    Header: () => <ColumnsHeader label={columnHeaders.supplierTwo} />,
    accessor: 'Second Supplier Name',
    show: true,
    Cell: (row) => renderCell(row.value),
  },
];

export default commodity_locations;
