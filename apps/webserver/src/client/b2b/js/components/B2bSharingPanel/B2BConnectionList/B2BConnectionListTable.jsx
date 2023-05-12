import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import B2BConnectionListStatus from './B2BConnectionListStatus';

const columns = [
  { field: 'organizationName', headerName: 'Organization Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params) => <B2BConnectionListStatus status={params.row.status} />,
    flex: 1,
  },
];

const B2BConnectionListTable = (props) => {
  const { rows } = props;
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
      pageSizeOptions={[5, 10, 25]}
      checkboxSelection
      disableSelectionOnClick
      autoHeight
    />
  );
};

export default B2BConnectionListTable;
