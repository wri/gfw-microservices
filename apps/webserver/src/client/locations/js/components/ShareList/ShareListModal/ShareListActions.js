import React from 'react';

const ShareListActions = (props) => {
  return (
    <div className="share-dialog__footer">
      <button className="sharelist__button white" onClick={() => props.handleDeny()}>no</button>
      <button className="sharelist__button" onClick={() => props.handleConfirm()}>yes</button>
    </div>
  );
}

export default ShareListActions;
