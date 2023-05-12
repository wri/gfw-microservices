import React, { useState } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Button from 'common/js/components/Button';
import { locationsPage } from '../../../../common/js/config';

const transifex = Transifex.live.translateText;

function LocationsTableColumnSelector({ listColumns, setListColumns, disabled }) {
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
    const visibleColumns = newListColumnsState.filter((col) => col.show).map((column) => column.accessor);
    setListColumns(visibleColumns);
  };

  // Update columns that are selected/unselected
  const updateCheck = (index) => {
    const newListColumnsState = listColumns.slice();
    newListColumnsState[index].show = !newListColumnsState[index].show;
    setArrayOfVisibleColumns(newListColumnsState);
    ga('send', 'event', 'Lists Click', 'Add column', 'user toggled a column in the lists table');
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
      <Button onClick={toggleColumnMenu} disabled={disabled} label={transifex(locationsPage.lists.addColumns)} />
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

export default LocationsTableColumnSelector;
