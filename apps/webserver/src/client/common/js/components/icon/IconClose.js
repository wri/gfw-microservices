import React from 'react';

export const IconClose = props => (
  <div className="close-icon pointer" onClick={() => props.onRequestClose()}>
    <svg>
      <use xlinkHref="#shape-close" />
    </svg>
  </div>
);
