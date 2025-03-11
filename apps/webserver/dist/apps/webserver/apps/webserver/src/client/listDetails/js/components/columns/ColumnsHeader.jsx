import React from 'react';
import InfoBubble from '../../../../common/js/components/InfoBubble';

const sanitizeLabel = (label) => label.replace(/\s+/g, '-');

const ColumnsHeader = ({ label, infoBubbleId }) => {
  const transifex = Transifex.live.translateText;

  return (
    <span
      className="title-text"
      title={transifex(label)}
      data-cy={`column-header-${sanitizeLabel(label)}`}
    >
      {transifex(label)}
      {infoBubbleId && <InfoBubble infoBubbleId={infoBubbleId} />}
    </span>
  );
};

export default ColumnsHeader;
