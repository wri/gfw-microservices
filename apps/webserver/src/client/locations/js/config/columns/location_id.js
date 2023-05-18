import React from 'react';
import { columnHeaders } from '../../../../common/js/config';
import ColumnsHeader from '../../components/columns/ColumnsHeader';

const location_id = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.siteId} />,
    accessor: 'location_id',
    className: 'cell__Site-ID default-cell td-num',
    show: false,
    width: 75,
    maxWidth: 75,
  },
];

export default location_id;