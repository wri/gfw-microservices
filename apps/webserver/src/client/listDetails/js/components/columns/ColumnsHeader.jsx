import React from 'react';

const ColumnsHeader = ({ label }) => {
  const transifex = Transifex.live.translateText;

  return (
    <span className="title-text" title={transifex(label)}>
      {transifex(label)}
    </span>
  );
};

export default ColumnsHeader;
