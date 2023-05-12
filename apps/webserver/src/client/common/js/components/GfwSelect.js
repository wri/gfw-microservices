import React from 'react';

function getLabel(option) {
  return String(typeof option === 'object' ? option.label : option);
}

function getValue(option) {
  return String(typeof option === 'object' ? option.value : option);
}

/* Wraps the native select element while providing an interface similar to
 * react-dropdown for easy drop-in replacement
 *
 * All props are added as props to the wrapped <select> with special handling
 * for 'options', 'value', 'placeholder', and 'onChange'
 */
const GfwSelect = (props) => {
  let selectedOption;
  if (typeof props.value !== 'object') {
    // 'buildDropdownOptions' puts the selected label in the value field...
    selectedOption = props.options.find((opt) => getLabel(opt) === String(props.value));
  } else {
    // Some callback handlers later turn value into an option object
    selectedOption = props.value;
  }

  const value = selectedOption ? getValue(selectedOption) : null;
  const options = props.options.map((option) => (
    <option value={getValue(option)} key={getValue(option)}>
      {getLabel(option)}
    </option>
  ));

  return (
    <select
      {...props}
      onChange={(evt) => {
        if (props.onChange) {
          props.onChange({
            value: evt.target.value,
            label: evt.target.selectedOptions[0].label,
          });
        }
      }}
      value={value !== null && value !== undefined ? value : ''}
    >
      {props.placeholder && <option value="">{props.placeholder}</option>}
      {options}
    </select>
  );
};

export default GfwSelect;
