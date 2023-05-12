import React, { useState } from 'react';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import IconButton from 'material-ui/IconButton';
import Icon from '@material-ui/core/Icon';
import MoreInformationLinks from './MoreInformationLinks';
import OtherAppsLinks from './OtherAppsLinks';
import { nav } from '../../config';
import './MoreInformationLinksDropdown.scss';

function MoreInformationLinksDropdown() {
  const [showList, setShowList] = useState(false);

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
        <div className={`drop-down-nav__list ${showList ? 'show' : 'hide'}`} style={{ width: '330px' }}>
          <div className="more-info-links-dropdown__title">{nav.moreMenu.apps}</div>
          <div className="more-info-links-dropdown__description">{nav.moreMenu.appsDescription}</div>
          <OtherAppsLinks />
          <hr />
          <div className="more-info-links-dropdown__title">{nav.more}</div>
          <div className="more-info-links-dropdown__description">{nav.moreMenu.sharingAndSecurityDescription}</div>
          <MoreInformationLinks />
        </div>
      </div>
    </ClickAwayListener>
  );
}

export default MoreInformationLinksDropdown;
