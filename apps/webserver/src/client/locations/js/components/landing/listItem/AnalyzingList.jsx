import React from 'react';
import Chip from '@mui/material/Chip';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import InlineLoader from '../../../../../common/js/components/Loaders/InlineLoader';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import sharedColumnText from './sharedColumnText';
import { locationsPage } from '../../../../../common/js/config';

// returns 'anaylizing' (also called 'pending') list items
function AnalyzingList({ list, isAListSharedWithMe, isShared, showSharedColumn }) {
  const { list_name, is_shared } = list;

  return (
    <li
      className="locations-list locations-list--inactive"
      title={locationsPage.landing.pendingMessage}
    >
      <div className="locations-list__title">
        {isAListSharedWithMe && <PublicIcon />}
        {list_name}
        {is_shared && <IconUsers className="locations-list__shared-icon" />}
      </div>
      {showSharedColumn && (
        <div className="locations-list__shared">
          <GroupsIcon />
          {sharedColumnText()}
        </div>
      )}

      <div className="locations-list__menu-container">
        <IconButton icon={<IconMenuDots />} title={''} disabled size="medium" variant="menu" />
      </div>
    </li>
  );
}

export default AnalyzingList;
