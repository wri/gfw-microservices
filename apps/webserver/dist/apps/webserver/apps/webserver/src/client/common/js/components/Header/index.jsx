import React from 'react';
import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import './Header.scss';

function Header({ links = {}, active }) {
  const isLoggedIn = links.logout;
  return (
    <>
      <DesktopHeader isLoggedIn={isLoggedIn} active={active} />
      {/* header is only responsive when user is logged out */}
      {!isLoggedIn && <MobileHeader isLoggedIn={isLoggedIn} />}
    </>
  );
}

export default Header;
