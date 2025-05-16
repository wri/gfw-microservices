import { useEffect, useState } from 'react';
import InfoBubble from '../../../../common/js/components/InfoBubble';

const sanitizeLabel = (label) => label.replace(/\s+/g, '-');

const ColumnsHeader = ({ label, infoBubbleId }) => {
  const [translatedLabel, setTranslatedLabel] = useState(label);

  const updateTranslation = () => {
    const translated = window.Transifex.live.translateText(label);
    setTranslatedLabel(translated);
  };

  useEffect(() => {
    if (!window.Transifex?.live) {
      return;
    }

    // Translate if Transifex is ready
    updateTranslation();

    // Function to update translation when the language changes
    const handleTranslationUpdate = () => updateTranslation();

    window.Transifex.live.onAfterTranslate(handleTranslationUpdate);

    // emove subscription when component unmounts
    return () => {
      window.Transifex.live.off?.('onAfterTranslate', handleTranslationUpdate);
    };
  }, [label]);

  return (
    <span className="title-text" data-cy={`column-header-${sanitizeLabel(label)}`}>
      <span>{translatedLabel}</span>
      {infoBubbleId && <InfoBubble infoBubbleId={infoBubbleId} />}
    </span>
  );
};

export default ColumnsHeader;
