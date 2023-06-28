import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import B2BConnectionListStatus from './B2BConnectionListStatus';
import ConnectionDetailsButton from '../ConnectionDetailsButton';

const B2BConnectionListTable = (props) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const columns = [
    {
      field: 'organizationName',
      headerName: 'Organization Name',
      flex: 1,
      renderCell: (params) => (
        <ConnectionDetailsButton
          connectionData={{
            organizationName: params.row.organizationName,
            status: params.row.status,
            name: params.row.name,
            email: params.row.email,
            id: params.row.id,
          }}
        />
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => (
        <B2BConnectionListStatus
          status={params.row.status}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          id={params.row.id}
        />
      ),
      flex: 1,
    },
  ];

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
