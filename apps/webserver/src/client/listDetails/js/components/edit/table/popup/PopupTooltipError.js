import React from 'react';

import './PopupTooltipError.scss';

export const PopupTooltipError = (props) => {
  const { errorMessage, showErrorMessage } = props;

  return (
    <span className="popup-tooltip--error">
      <div data-show-error-message={showErrorMessage} className="popup-tooltip--error-message">
        {errorMessage}
      </div>
    </span>
  );
};
