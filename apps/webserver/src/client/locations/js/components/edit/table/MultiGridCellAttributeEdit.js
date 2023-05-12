import React from 'react';
import * as PropTypes from 'prop-types';

export function MultiGridCellAttributeEdit(props) {
  return (
    <td className={`locations-table-td ${props.valid ? 'valid-td' : 'invalid-td'}`}>
      <input className="StepOneEdit__input" onInput={props.onInput} defaultValue={props.feature[props.customAttributeName]} />
    </td>
  );
}

MultiGridCellAttributeEdit.propTypes = {
  valid: PropTypes.bool,
  onInput: PropTypes.func,
  feature: PropTypes.any,
  customAttributeName: PropTypes.any,
};
