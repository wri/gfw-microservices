import React from 'react';
import * as PropTypes from 'prop-types';

export const MultiGridCellCheckbox = ({ i, locationID, style, checkboxChecked, rowHaveError, _handlingCheckboxChange }) => (
  <div
    key={i + checkboxChecked}
    className={`column-checkbox-location ${rowHaveError ? 'row-invalid--first' : 'row-valid--first'}`}
    style={{ ...style }}
  >
    <input
      type="checkbox"
      className="column-checkbox"
      id={`checkbox-${i}`}
      name={i}
      checked={!(checkboxChecked === undefined || checkboxChecked === false)}
      onChange={() => _handlingCheckboxChange(locationID)}
    />
    <label htmlFor={`checkbox-${i}`} className="column-checkbox column-checkbox-single" />
  </div>
);

MultiGridCellCheckbox.propTypes = {
  i: PropTypes.any,
  style: PropTypes.object,
  featureResults: PropTypes.any,
  _handlingCheckboxChange: PropTypes.func,
};
