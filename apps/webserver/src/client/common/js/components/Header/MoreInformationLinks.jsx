import React from 'react';
import Icon from '@material-ui/core/Icon';
import { nav } from '../../config';
import './IconLink.scss';

function MoreInformationLinks() {
  return (
    <div>
      <div>
        <div style={{ display: 'flex' }}>
          <div className="icon-link">
            <a target="_blank" href={nav.moreMenu.sharingLink} rel="noreferrer">
              <Icon>share</Icon>
              {nav.moreMenu.sharing}
            </a>
          </div>
          <div className="icon-link">
            <a target="_blank" href={nav.moreMenu.securityLink} rel="noreferrer">
              <Icon>security</Icon>
              {nav.moreMenu.security}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreInformationLinks;
