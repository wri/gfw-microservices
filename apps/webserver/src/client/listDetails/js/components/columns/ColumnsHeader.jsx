import { useEffect, useState } from 'react';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import { getManualTranslation } from '../../config/columns/columnHeaders.constants';

const sanitizeLabel = (label) => label.replace(/\s+/g, '-');

const ColumnsHeader = ({ label, infoBubbleId, subtitle }) => {
  const [translatedLabel, setTranslatedLabel] = useState(label);
  const [translatedSubtitle, setTranslatedSubtitle] = useState(subtitle);

  const updateTranslation = () => {
    if (!window.Transifex?.live) {
      return;
    }

    const transifexTranslation = window.Transifex.live.translateText(label);
    const languageCode = window.Transifex.live.getSelectedLanguageCode?.() || 'en';

    // If Transifex returns the same string, try manual translation
    if (transifexTranslation === label) {
      const manualTranslation = getManualTranslation(label, languageCode);
      setTranslatedLabel(manualTranslation);
    } else {
      setTranslatedLabel(transifexTranslation);
    }

    if (subtitle) {
      const transifexSubtitle = window.Transifex.live.translateText(subtitle);
      if (transifexSubtitle === subtitle) {
        setTranslatedSubtitle(getManualTranslation(subtitle, languageCode));
      } else {
        setTranslatedSubtitle(transifexSubtitle);
      }
    }
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

    // remove subscription when component unmounts
    return () => {
      window.Transifex.live.off?.('onAfterTranslate', handleTranslationUpdate);
    };
  }, [label, subtitle]);

  return (
    <span className="title-text" data-cy={`column-header-${sanitizeLabel(label)}`}>
      <span>
        <span>{translatedLabel}</span>
        {infoBubbleId && <InfoBubble infoBubbleId={infoBubbleId} />}
        {subtitle && (
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'normal' }}>
            {translatedSubtitle}
          </span>
        )}
      </span>
    </span>
  );
};

export default ColumnsHeader;
