import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button as MaterialButton } from '@mui/material';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Button from 'common/js/components/Button';
import { locationsPage } from '../../../../../common/js/config';

const transifex = Transifex.live.translateText;

function ColumnSelector({ listColumns, setListColumns }) {
  const [displayColumnSelectionMenu, setDisplayColumnSelectionMenu] = useState(false);
  const [anchorElColumnMenu, setAnchorElColumnMenu] = useState();

  // Add/Remove Column toggle function
  const toggleColumnMenu = (event) => {
    event.preventDefault();
    setDisplayColumnSelectionMenu(true);
    setAnchorElColumnMenu(event.currentTarget);
  };

  // Add/Remove Column close function
  const closeColumnMenu = () => {
    setDisplayColumnSelectionMenu(false);
  };

  const setArrayOfVisibleColumns = (newListColumnsState) => {
    const visibleColumns = newListColumnsState
      .filter((col) => col.show)
      .map((column) => column.accessor);
    setListColumns(visibleColumns);
  };

  // Update columns that are selected/unselected
  const updateCheck = (index) => {
    const newListColumnsState = listColumns.slice();
    newListColumnsState[index].show = !newListColumnsState[index].show;
    setArrayOfVisibleColumns(newListColumnsState);
    gtag('event', 'Add column', {
      event_category: 'Lists Click',
      event_label: 'user toggled a column in the lists table',
    });
  };

  const selectAllColumnsToggle = (newState) => {
    const newListColumnsState = listColumns
      ?.filter((column) => column.accessor !== 'location_id')
      .map((col) => ({
        ...col,
        show: newState,
      }));
    setArrayOfVisibleColumns(newListColumnsState);
  };

  const displayedColumns = listColumns
    ?.filter((column) => column.accessor !== 'location_id')
    .map((column, index) => (
      <div className="select-columns__checkbox-container" key={listColumns[index].accessor}>
        <input
          id={`checkBox-${index}`}
          type="checkbox"
          checked={listColumns[index].show}
          onChange={() => updateCheck(index)}
        />
        <label htmlFor={`checkBox-${index}`}>{column.accessor}</label>
      </div>
    ));

  return (
    <>
      <MaterialButton
        sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
        onClick={toggleColumnMenu}
      >
        <MoreVertIcon sx={{ color: 'black' }} />
      </MaterialButton>

      <Popover
        open={displayColumnSelectionMenu}
        anchorEl={anchorElColumnMenu}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={closeColumnMenu}
      >
        <Menu className="add-columns-list">
          <div className="select-columns">{displayedColumns}</div>
          <div className="add-columns-list__footer">
            <Button
              variant="secondary"
              onClick={() => selectAllColumnsToggle(true)}
              label={transifex(locationsPage.lists.selectAll)}
            />
            <Button
              variant="secondary"
              onClick={() => selectAllColumnsToggle(false)}
              label={transifex(locationsPage.lists.unselectAll)}
            />
          </div>
        </Menu>
      </Popover>
    </>
  );
}

export default ColumnSelector;
