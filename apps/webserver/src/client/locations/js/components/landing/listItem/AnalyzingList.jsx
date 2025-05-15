import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import IconUsers from '../../../../../common/js/components/icon/IconUsers';
import IconButton from '../../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../../common/js/components/icon/IconMenuDots';
import sharedColumnText from './sharedColumnText';
import { locationsPage } from '../../../../../common/js/config';
import AnalysisListChips from './AnalysisListChips';

// returns 'anaylizing' (also called 'pending') list items
function AnalyzingList({ list, isAListSharedWithMe, showSharedColumn }) {
  const { id, list_name, is_shared, listAnalysesStatus } = list;

  const goToListDetails = () => {
    // clicked a location with a successfully completed analysis; go to it
    gtag('event', 'List click', {
      event_category: 'Landing',
      event_label: `user clicked on list ${list_name}`,
    });

    window.location = `/list-details?id=${id}${is_shared ? '&shared=true' : ''}`;
  };

  return (
    <li
      className="locations-list"
      title={locationsPage.landing.pendingMessage}
      onClick={goToListDetails}
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
      <div className="locations-list__controls">
        <AnalysisListChips listAnalysesStatus={listAnalysesStatus} />
      </div>

      <div className="locations-list__menu-container">
        <IconButton icon={<IconMenuDots />} title={''} disabled size="medium" variant="menu" />
      </div>
    </li>
  );
}

export default AnalyzingList;
