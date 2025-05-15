import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import { renderCell } from './columns.utils';

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
