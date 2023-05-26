import React, { useState } from 'react';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import IconButton from 'material-ui/IconButton';
import Icon from '@material-ui/core/Icon';
import './DropDownNav.scss';

function AccountDropDownMenu() {
  const [displayOptions, setDisplayOptions] = useState(false);

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (displayOptions) {
          setDisplayOptions(false);
        }
      }}
    >
      <div className={`drop-down-nav  ${displayOptions ? 'drop-down-nav--selected' : ''}`}>
        <IconButton
          className="drop-down-nav__button"
          onClick={() => setDisplayOptions(!displayOptions)}
        >
          <Icon>account_circle</Icon>
        </IconButton>

        <div className={`drop-down-nav__list ${displayOptions ? 'show' : 'hide'}`}>
          <a href="/profile" className="drop-down-nav__list-item">
            My Profile
          </a>
          <a href="/auth/signout" className="drop-down-nav__list-item">
            Logout
          </a>
        </div>
      </div>
    </ClickAwayListener>
  );
}

export default AccountDropDownMenu;
