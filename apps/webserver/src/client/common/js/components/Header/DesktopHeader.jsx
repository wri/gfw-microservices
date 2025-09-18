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
            <HeaderNavLink active={active} link="/dashboard" label="Alerts" />
            <HeaderNavLink
              active={active}
              link="https://www.globalforestwatch.org/help/gfw-pro/guides/"
              label="Help Center"
            />
            <NewFeatureNotifications />
            <AccountDropDownMenu />
          </>
        )}

        {!isLoggedIn && (
          <>
            <HeaderNavLink
              active={active}
              link="https://pro-news.globalforestwatch.org/"
              label={nav.newsAndEvents}
            />
            <HeaderNavLink active={active} link="/about" label="About" />
            <HeaderNavLink
              active={active}
              link="https://pro-news.globalforestwatch.org/users"
              label={nav.users}
            />
            <HeaderNavLink
              active={active}
              link="https://www.globalforestwatch.org/blog/category-and-topics/?topic=commodities"
              label="Blog"
            />
            <HeaderNavLink
              active={active}
              link="https://www.globalforestwatch.org/help/gfw-pro/"
              label="Help Center"
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
