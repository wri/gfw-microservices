import React from 'react';
import Icon from '@material-ui/core/Icon';
import { nav } from '../../config';
import logoGfw from './images/logo_gfw.svg';
import logoGfwForestWatcher from './images/logo_gfw_forest_watcher.png';
import logoMapBuilder from './images/icon-MapBuilder.jpg';
import './IconLink.scss';

function OtherAppsLinks() {
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div className="icon-link">
          <a target="_blank" href="https://www.globalforestwatch.org/" rel="noreferrer">
            <img src={logoGfw} alt="gfw logo" />
          </a>
        </div>
        <div className="icon-link">
          <a target="_blank" href="https://forestwatcher.globalforestwatch.org/" rel="noreferrer">
            <img src={logoGfwForestWatcher} alt="forest watcher logo" />
          </a>
        </div>
        <div className="icon-link">
          <a href="https://mapbuilder.wri.org/" target="_blank" rel="noreferrer">
            <img src={logoMapBuilder} alt="map builder logo" />
          </a>
        </div>
        <div className="icon-link">
          <a target="_blank" href="https://www.wri.org/data" rel="noreferrer">
            <Icon>more-horiz</Icon>
            <br />
            <div className="explore-all__text">{nav.moreMenu.allApps}</div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default OtherAppsLinks;
