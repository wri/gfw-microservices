import React, { useMemo } from 'react';
import { dataGridColumns } from './dataGridColumns';
import { DataGrid } from '@mui/x-data-grid';

const WrappedDataGrid = ({
  filteredLists,
  visibleColumns,
  numberOfResults,
  page,
  pageSize,
  onPaginationModelChange,
  tableSortedBy,
  tableSortedDesc,
  onSortModelChange,
  selectionModel,
  onSelectionModelChange,
}) => {
  const dataGridVisibleColumns = useMemo(() => {
    const selectedVisibleColumns = visibleColumns.map((columnName) => ({
      field: columnName,
      headerName: columnName,
      width: 130,
    }));

    return dataGridColumns.concat(selectedVisibleColumns);
  }, [visibleColumns, dataGridColumns]);

  return (
    <DataGrid
      rows={filteredLists}
      columns={dataGridVisibleColumns}
      pageSizeOptions={[5, 10]}
      disableColumnMenu
      sx={{
        '& .MuiDataGrid-columnHeader': {
          background: 'lightgray',
        },

        '& .MuiCheckbox-root': {
          color: '#97bd3d !important',
        },
      }}
      pagination
      rowsPerPageOptions={[]}
      rowCount={numberOfResults}
      paginationMode="server"
      paginationModel={{ page, pageSize }}
      onPaginationModelChange={onPaginationModelChange}
      sortModel={[
        {
          field: tableSortedBy,
          sort: tableSortedDesc ? 'desc' : 'asc',
        },
      ]}
      onSortModelChange={onSortModelChange}
      selectionModel={selectionModel}
      checkboxSelection
      onSelectionModelChange={onSelectionModelChange}
    />
  );
};

export default WrappedDataGrid;
