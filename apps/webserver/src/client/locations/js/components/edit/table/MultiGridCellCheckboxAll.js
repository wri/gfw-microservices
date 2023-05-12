import * as PropTypes from 'prop-types';
import React from 'react';

export function MultiGridCellCheckboxAll(props) {
  return (
    <div className="MultiGridHeader__checkbox" style={props.style}>
      <input
        id="editListSelectAll"
        type="checkbox"
        value={'select all'}
        checked={props.checked}
        onChange={props.onChange}
        className="column-checkbox"
      />
      <label htmlFor="editListSelectAll" className="column-checkbox column-checkbox-single edit-list-select-all-label">
        <span className="edit-list-select-all-span">All</span>
      </label>
    </div>
  );
}

MultiGridCellCheckboxAll.propTypes = {
  style: PropTypes.object,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};
