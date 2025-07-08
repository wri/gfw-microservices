import { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Button as MaterialButton,
  Popover,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';

function ColumnSelector({ listColumns, visibleColumns, setListColumns }) {
  const [displayColumnSelectionMenu, setDisplayColumnSelectionMenu] = useState(false);
  const [anchorElColumnMenu, setAnchorElColumnMenu] = useState(null);

  const toggleColumnMenu = (event) => {
    event.preventDefault();
    setDisplayColumnSelectionMenu(true);
    setAnchorElColumnMenu(event.currentTarget);
  };

  const closeColumnMenu = () => {
    setDisplayColumnSelectionMenu(false);
  };

  const setArrayOfVisibleColumns = (newListColumnsState) => {
    const visible = newListColumnsState.filter((col) => col.show).map((column) => column.accessor);
    setListColumns(visible);
  };

  const updateCheck = (accessorOfCheckedColumn) => {
    const newVisibleColumns = visibleColumns.includes(accessorOfCheckedColumn)
      ? visibleColumns.filter((column) => column !== accessorOfCheckedColumn)
      : [...visibleColumns, accessorOfCheckedColumn];

    const newListColumnsState = listColumns.map(({ accessor }) => ({
      accessor,
      show: newVisibleColumns.includes(accessor),
    }));

    setArrayOfVisibleColumns(newListColumnsState);

    gtag('event', 'Add column', {
      event_category: 'Lists Click',
      event_label: 'user toggled a column in the lists table',
    });
  };

  const toggleSelectAll = (checked) => {
    const newListColumnsState = listColumns
      ?.filter((column) => column.accessor !== 'location_id')
      .map((col) => ({
        ...col,
        show: checked,
      }));
    setArrayOfVisibleColumns(newListColumnsState);
  };

  const allSelected = listColumns
    ?.filter((col) => col.accessor !== 'location_id')
    .every((col) => visibleColumns.includes(col.accessor));

  const filteredColumns = listColumns
    ?.filter((column) => column.accessor !== 'location_id')
    .sort((a, b) => a.accessor.localeCompare(b.accessor));

  const displayedColumns = filteredColumns.map((column, index) => (
    <FormControlLabel
      key={column.accessor}
      control={
        <Checkbox
          size="small"
          id={`checkBox-${index}`}
          data-cy={`column-selector-${column.accessor.replace(/\s+/g, '-')}`}
          checked={visibleColumns.includes(column.accessor)}
          onChange={() => updateCheck(column.accessor)}
        />
      }
      label={
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {column.accessor}
        </Typography>
      }
      sx={{ mb: 0.5 }}
    />
  ));

  const columnThreshold = 6; // after this number of options we show two columns
  const columnLayout = {
    display: 'grid',
    gridTemplateColumns: filteredColumns.length > columnThreshold ? '1fr 1fr' : '1fr',
    gap: 1,
    maxHeight: 300,
    overflowY: 'auto',
    pr: 1,
  };

  return (
    <>
      <MaterialButton data-cy="column-selector-button" onClick={toggleColumnMenu}>
        <MoreVertIcon sx={{ color: 'black' }} />
      </MaterialButton>

      <Popover
        open={displayColumnSelectionMenu}
        anchorEl={anchorElColumnMenu}
        onClose={closeColumnMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 'auto' }}>
          <Typography variant="h7" sx={{ fontWeight: 'bold', display: 'block' }}>
            Show/Hide table columns
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={visibleColumns.length > 0 && !allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                data-cy="select-deselect-all-columns"
              />
            }
            label={
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                Select/Deselect All Columns
              </Typography>
            }
            sx={{ mb: 1, mt: 2 }}
          />

          <Divider sx={{ mb: 1 }} />

          <Box sx={columnLayout}>{displayedColumns}</Box>
        </Box>
      </Popover>
    </>
  );
}

export default ColumnSelector;
