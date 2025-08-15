import ColumnsHeader from '../../components/columns/ColumnsHeader';
import { checkValid, formatDigit } from '../../../../locations/js/utils/locationsTableUtils';
import { renderCell } from './columns.utils';

const draft_state_columns = [
  {
    Header: () => <ColumnsHeader label="Size (ha)" />,
    accessor: 'Analysis Area',
    className: 'default-cell td-num',
    id: 'total_area_ha',
    show: false,
    Cell: (row) => {
      return renderCell(formatDigit(row.original?.['Analysis Area']));
    },
  },
  {
    Header: () => <ColumnsHeader label="State" />,
    accessor: 'state',
    className: 'default-cell',
    show: false,
    width: 150,
    maxWidth: 150,
    Cell: (row) => (checkValid(row.value) ? <span>{row.value}</span> : '--'),
  },
  {
    Header: () => <ColumnsHeader label="Sub State" />,
    accessor: 'subState',
    className: 'default-cell',
    show: false,
    width: 150,
    maxWidth: 150,
    Cell: (row) => (checkValid(row.value) ? <span>{row.value}</span> : '--'),
  },
];

export default draft_state_columns;
