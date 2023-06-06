import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LanguageDropdownMenuMobile from './LanguageDropdownMenuMobile';
import OtherAppsAccordion from './OtherAppsAccordion';
import HeaderNavLink from '../HeaderNavLink';
import MoreInformationAccordion from './MoreInformationAccordion';
import LoginForm from '../LoginForm';
import Logo from '../Logo';
import { nav } from '../../../config';
import '../Header.scss';

function MobileHeader({ isLoggedIn }) {
  const [displayMenu, setDisplayMenu] = useState(false);
  return (
    <>
      <header className="header header--mobile">
        <nav className="header__container">
          <Logo isLoggedIn={isLoggedIn} />
          <LoginForm />
          <IconButton size="large" edge="start" aria-label="menu" sx={{ mr: 2, color: 'white' }}>
            <MenuIcon onClick={() => setDisplayMenu(true)} />
          </IconButton>
        </nav>
      </header>
      {displayMenu && (
        <div className="header__mobile-menu-list">
          <MenuList>
            <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
              <IconButton onClick={() => setDisplayMenu(false)} size="large" edge="start">
                <CloseIcon />
              </IconButton>
            </div>

            <div style={{ justifyContent: 'center', display: 'flex', paddingBottom: '10px' }}>
              <HeaderNavLink
                link="/account"
                label={nav.requestAccount}
                className="header__request-account-button"
              />
            </div>
            <MenuItem>
              <ListItemText>
                <HeaderNavLink link="/about" label="About" />
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem>
              <ListItemText>
                <HeaderNavLink
                  link="https://www.globalforestwatch.org/blog/tag/gfw-pro"
                  label="Blog"
                />
              </ListItemText>
            </MenuItem>
            <Divider />
            <LanguageDropdownMenuMobile />
            <Divider />
            <OtherAppsAccordion />
            <Divider />
            <MoreInformationAccordion />
          </MenuList>
          <Divider />
        </div>
      )}
    </>
  );
}

export default MobileHeader;
