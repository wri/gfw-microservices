import React from 'react';
import { HeaderNavLink } from './HeaderNavLink';

function ManagerHeader({ links = {}, active }) {
  return (
    <div id="ManagerHeader" className="app__header">
      <nav className="app__navigation">
        <ul className="app__navigation-list">
          {!links.logout ? undefined : <HeaderNavLink active link="/auth/signout" label="Logout" />}
        </ul>
        {active && <img src="GFW_PRO-logo.png" alt="GFW PRO logo" className="app__logo" />}
      </nav>
    </div>
  );
}

export default ManagerHeader;
