import React from 'react';

const ShareListOption = (props) => {
  return props.listOpitions.map((option, i) => {
    return (
      <button
        key={`sharelist__option-${i}`}
        className="sharelist__option"
        onClick={() => {
          props.handleClick(option);
        }}
      >
        <p className="sharelist__label">{option.tag}</p>
        {option.name}
      </button>
    );
  });
};

export default ShareListOption;
