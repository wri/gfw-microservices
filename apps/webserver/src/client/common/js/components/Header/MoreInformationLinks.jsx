import { Icon } from '@mui/material';

import { nav } from '../../config';
import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';
import './IconLink.scss';

function MoreInformationLinks() {
  const sharingLabel = useTransifexTranslation(nav.moreMenu.sharing);
  const securityLabel = useTransifexTranslation(nav.moreMenu.security);

  return (
    <div>
      <div>
        <div style={{ display: 'flex' }}>
          <div className="icon-link">
            <a target="_blank" href={nav.moreMenu.sharingLink} rel="noreferrer">
              <Icon>share</Icon>
              {sharingLabel}
            </a>
          </div>
          <div className="icon-link">
            <a target="_blank" href={nav.moreMenu.securityLink} rel="noreferrer">
              <Icon>security</Icon>
              {securityLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreInformationLinks;
