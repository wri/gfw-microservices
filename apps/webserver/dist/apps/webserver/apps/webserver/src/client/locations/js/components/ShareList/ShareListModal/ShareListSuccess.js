import React from 'react';
import IconGroup from '../../../../../common/js/components/icon/IconGroup';

const ShareListSuccess = (props) => {
  return (
    <div className="sharelist__success">
      <IconGroup />
      <h3 className="sharelist__title">Success!</h3>
      <p className="sharelist__label">
        You shared {props.listName} with {props.userName}.
      </p>
    </div>
  );
};

export default ShareListSuccess;
