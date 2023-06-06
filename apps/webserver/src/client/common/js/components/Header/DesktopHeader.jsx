import React from 'react';
import HeaderNavLink from './HeaderNavLink';
import NewFeatureNotifications from './NewFeatureNotifications';
import AccountDropDownMenu from './AccountDropDownMenu';
import MoreInformationLinksDropdown from './MoreInformationLinksDropdown';
import LoginForm from './LoginForm';
import LanguageDropdownMenu from './LanguageDropdownMenu';
import Logo from './Logo';
import { nav } from '../../config';
import './Header.scss';

function DesktopHeader({ isLoggedIn, active }) {
  const isProManager = active === 'pro-manager';
  return (
    <header className={`header ${isLoggedIn ? '' : 'header--responsive'}`} data-cy="desktopHeader">
      <nav className="header__container">
        <Logo isLoggedIn={isLoggedIn} />

        {isLoggedIn && isProManager && (
          <HeaderNavLink active={active} link="/auth/signout" label="Logout" />
        )}

        {isLoggedIn && !isProManager && (
          <>
            <HeaderNavLink active={active} link="/locations" label="Locations" />
            <HeaderNavLink active={active} link="/map" label="Map" />
            <HeaderNavLink active={active} link="/dashboard" label="Dashboard" />
            <HeaderNavLink active={active} link="/b2b" label="B2B" />
            <NewFeatureNotifications />
            <AccountDropDownMenu />
          </>
        )}

        {!isLoggedIn && (
          <>
            <HeaderNavLink active={active} link="/about" label="About" />
            <HeaderNavLink
              active={active}
              link="https://www.globalforestwatch.org/blog/tag/gfw-pro"
              label="Blog"
            />
            <HeaderNavLink
              link="/account"
              label={nav.requestAccount}
              className="header__request-account-button"
            />
            <LoginForm />
          </>
        )}

        {!isProManager && (
          <>
            <MoreInformationLinksDropdown />
            <LanguageDropdownMenu />
          </>
        )}
      </nav>
    </header>
  );
}

export default DesktopHeader;
