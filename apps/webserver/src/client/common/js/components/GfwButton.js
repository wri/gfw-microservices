import React from 'react';

const GfwButton = props => {
  return (
    <button
      className={`gfw-button ${props.classNames} ${props.disabled ? 'button-disabled' : ''}`}
      data-tip={props.dataTip}
      data-for={props.dataFor}
      onClick={props.onClick}
      disabled={props.disabled}
      style={props.buttonStyle}
    >
      {props.value}
    </button>
  );
};

export default GfwButton;
