import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import { renderCell } from './columns.utils';

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
