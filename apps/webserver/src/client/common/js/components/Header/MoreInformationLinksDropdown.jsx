import { useState } from 'react';
import { ClickAwayListener, Icon, IconButton } from '@mui/material';
import MoreInformationLinks from './MoreInformationLinks';
import OtherAppsLinks from './OtherAppsLinks';
import { nav } from '../../config';
import { useTransifexTranslation } from '../../../../hooks/useTransifexTranslation';
import './MoreInformationLinksDropdown.scss';

function MoreInformationLinksDropdown() {
  const [showList, setShowList] = useState(false);
  const appsLabel = useTransifexTranslation(nav.moreMenu.apps);
  const appsDescriptionLabel = useTransifexTranslation(nav.moreMenu.appsDescription);
  const moreLabel = useTransifexTranslation(nav.more);
  const sharingAndSecurityDescriptionLabel = useTransifexTranslation(
    nav.moreMenu.sharingAndSecurityDescription
  );

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (showList) {
          setShowList(false);
        }
      }}
    >
      <div className="drop-down-nav more-info-links-dropdown">
        <IconButton onClick={() => setShowList(!showList)}>
          <Icon>apps</Icon>
        </IconButton>
        <div
          className={`drop-down-nav__list ${showList ? 'show' : 'hide'}`}
          style={{ width: '330px' }}
        >
          <div className="more-info-links-dropdown__title">{appsLabel}</div>
          <div className="more-info-links-dropdown__description">{appsDescriptionLabel}</div>
          <OtherAppsLinks />
          <hr />
          <div className="more-info-links-dropdown__title">{moreLabel}</div>
          <div className="more-info-links-dropdown__description">
            {sharingAndSecurityDescriptionLabel}
          </div>
          <MoreInformationLinks />
        </div>
      </div>
    </ClickAwayListener>
  );
}

export default MoreInformationLinksDropdown;
