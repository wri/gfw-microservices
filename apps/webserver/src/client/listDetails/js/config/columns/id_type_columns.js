import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const id_type_columns = [
  {
    Header: () => (
      <ColumnsHeader label="ID Type" infoBubbleId={infoBubbleConfig.listDetailsIdType} />
    ),
    accessor: 'ID Type',
    show: true,
    className: 'default-cell',
    id: 'id-type',
    Cell: ({ original }) => <span>{original?.['ID Type']}</span>,
    sortMethod: (l, r) => {
      if (l && r) {
        return l.localeCompare(r);
      }
      return 0;
    },
  },
  {
    Header: () => <ColumnsHeader label="ID" infoBubbleId={infoBubbleConfig.listDetailsIdValue} />,
    accessor: 'ID',
    show: true,
    className: 'default-cell',
    id: 'id',
    Cell: ({ original }) => <span>{original?.['ID']}</span>,
    sortMethod: (l, r) => {
      if (l && r) {
        return l.localeCompare(r);
      }
      return 0;
    },
  },
  {
    Header: () => (
      <ColumnsHeader label="Palm Mill ID" infoBubbleId={infoBubbleConfig.listDetailsIdValue} />
    ),
    accessor: 'Palm Mill ID',
    show: true,
    className: 'default-cell',
    id: 'palm-mill-id',
    Cell: ({ original }) => <span>{original?.['Palm Mill ID']}</span>,
    sortMethod: (l, r) => {
      if (l && r) {
        return l.localeCompare(r);
      }
      return 0;
    },
  },
  {
    Header: () => <ColumnsHeader label="ID Updated Date" />,
    accessor: 'ID Updated Date',
    show: true,
    className: 'default-cell',
    id: 'id-updated-date',
    Cell: ({ original }) => <span>{original?.['ID Updated Date']}</span>,
    sortMethod: (l, r) => {
      if (l && r) {
        return l.localeCompare(r);
      }
      return 0;
    },
  },
];

export default id_type_columns;
