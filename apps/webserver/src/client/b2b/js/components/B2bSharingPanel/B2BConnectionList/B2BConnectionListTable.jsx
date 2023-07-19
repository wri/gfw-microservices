import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import B2BConnectionListStatus from './B2BConnectionListStatus';
import B2bConnectionDetailsModal from '../ConnectionDetailsButton/B2bConnectionDetailsModal';

const B2BConnectionListTable = (props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [displayModal, setDisplayModal] = useState(false);
  const [connectionModalData, setConnectionModalData] = useState(false);

  const handleOpenDetailsModal = (row) => {
    setDisplayModal(true);
    setConnectionModalData(row)
  }

  const columns = [
    {
      field: 'organizationName',
      headerName: 'Organization Name',
      flex: 1,
      renderCell: (params) => (
        <button
          type="button"
          className="new-b2b-connection-modal__action-button"
          onClick={() => {
            handleOpenDetailsModal(params.row)
          }}
        >
          {params.row.organizationName}
        </button>
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
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
      />
      {displayModal && (
        <B2bConnectionDetailsModal
          onCloseModal={() => setDisplayModal(false)}
          connectionData={connectionModalData}
        />
      )}
    </>
  );
};

export default B2BConnectionListTable;
