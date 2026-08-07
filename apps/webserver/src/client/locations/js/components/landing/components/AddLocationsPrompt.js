import { useTransifexTranslation } from '../../../../../hooks/useTransifexTranslation';
import { GFW_PRO_HELP_CENTER__LINK } from '../../../../../common/js/config';

/**
 * Showing text for Locations page when no location added to organization
 *
 * ### Original location of content is in config.locationsPage.landing.addLocationsPrompt
 *
 * @return {JSX.Element}
 * @constructor
 */
const AddLocationsPrompt = () => {
  const uploadText = useTransifexTranslation('Upload or enter locations by clicking the');
  const addLocationsText = useTransifexTranslation('ADD LOCATIONS');
  const helpIntroText = useTransifexTranslation('If you need help, please visit the');
  const howToGuideText = useTransifexTranslation('how-to guide');

  return (
    <div className="no-lists__prompt">
      <p>
        {uploadText} <strong>{addLocationsText}</strong> button. {helpIntroText}{' '}
        <a target="_blank" className="no-lists__how-to" href={GFW_PRO_HELP_CENTER__LINK}>
          {howToGuideText}
        </a>
        .
      </p>
    </div>
  );
};

export default AddLocationsPrompt;
