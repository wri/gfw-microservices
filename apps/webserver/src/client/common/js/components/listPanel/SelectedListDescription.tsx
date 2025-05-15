import { FC } from 'react';
import { useSelector } from 'react-redux';
import { numberWithCommas } from '../../../../locations/js/utils/locationsTableUtils';

interface SharedList {
  id: string | number;
}
interface List {
  list_name: string;
  list_locations_count: number;
  isGlobalForestWatchList: boolean;
  id: number;
}

interface RootState {
  selectedLists: List[];
  selectedList: List;
}

interface SelectedListDescriptionProps {
  totalNumberOfLocationsInAccount?: number;
  userSharedLists?: SharedList[];
  redirectToAlerts?: boolean;
  listContext?: 'map' | 'dashboard';
}

const SelectedListDescription: FC<SelectedListDescriptionProps> = ({
  totalNumberOfLocationsInAccount = 0,
  userSharedLists = [],
  redirectToAlerts,
  listContext,
}) => {
  // we use this component in dashboard and in the map
  // the selected list is stored as an array in map (selectedLists)
  // in dashboard the selected list is stored directly (selectedList)
  const selectedList =
    listContext === 'map'
      ? useSelector((state: RootState) => state.selectedLists[0])
      : useSelector((state: RootState) => state.selectedList);

  // if there is a list selected
  const isListSelected = typeof selectedList === 'object' && Object.keys(selectedList).length;

  let numberOfLocations;
  let listName;

  if (!isListSelected) {
    // no list was selected, show total number of locations
    numberOfLocations = numberWithCommas(totalNumberOfLocationsInAccount);
    listName = 'All Locations';
  } else {
    // full list was selected but it does not contain specific locations selected
    numberOfLocations = numberWithCommas(selectedList.list_locations_count);
    listName = selectedList?.list_name;
  }
  const goToDashboard = () => {
    // TODO: use get params
    const request = new XMLHttpRequest();
    request.open('POST', '/dashboard/map-locations', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();
    request.onload = () => {
      if (request.response === 'return') {
        window.location.href = '/dashboard';
      }
    };
    request.onerror = (err) => {
      console.log(err);
    };
  };

  const goToList = () => {
    const { isGlobalForestWatchList, id } = selectedList;
    const selectedListIsShared = userSharedLists
      ?.map((userSharedList) => userSharedList.id)
      .includes(id);
    const addShared = selectedListIsShared ? `&shared=true` : ``;
    const gfwListFlag = isGlobalForestWatchList ? '&gfw=true' : '';

    window.location.href = `/list-details?id=${id}${addShared}${gfwListFlag}`;
  };

  const handleBack = () => {
    if (!isListSelected) {
      return;
    }
    gtag('event', 'Map GO TO MAP link clicked', {
      event_category: 'Map Click',
      event_label: 'User click on a GO TO MAP link',
    });
    if (redirectToAlerts) {
      goToDashboard();
    } else {
      goToList();
    }
  };

  return (
    <div
      className={`list-section-info ${isListSelected ? 'link-to-list' : ''}`}
      onClick={handleBack}
    >
      <span>{`${numberOfLocations} - ${listName}`}</span>
    </div>
  );
};

export default SelectedListDescription;
