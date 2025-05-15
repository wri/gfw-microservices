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
  return (
    <div className="no-lists__prompt">
      <p>
        Upload or enter locations by clicking the <strong>ADD LOCATIONS</strong> button. If you need
        help, please visit the{' '}
        <a target="_blank" className="no-lists__how-to" href={GFW_PRO_HELP_CENTER__LINK}>
          Help Center
        </a>
        .
      </p>
    </div>
  );
};

export default AddLocationsPrompt;
