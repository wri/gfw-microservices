import React from 'react';
import { numberWithCommas } from '../../../../locations/js/utils/locationsTableUtils';

function SelectedListDescription({
  selectedLists = {},
  transitionListData = {},
  totalNumberOfLocationsInAccount = 0,
  currentView,
  userSharedLists = {},
}) {
  // list data comming from previous view (dashboard or list view)
  const { filterCount, name, numLocations } = transitionListData;
  const listId = selectedLists?.id || transitionListData?.id;
  const isListSelected =
    Object.keys(selectedLists).length || Object.keys(transitionListData).length;

  // if a list is selected and we are in the map view, make it a link
  const isLinkToList = isListSelected && currentView === 'map';

  let numberOfLocations;
  let listName;
  let numberOfFiltersApplied;

  if (!isListSelected) {
    // no list was selected, show total number of locations
    numberOfLocations = numberWithCommas(totalNumberOfLocationsInAccount);
    listName = 'All Locations';
    numberOfFiltersApplied = '';
  } else if (Object.keys(transitionListData).length) {
    // full list or specific locations from a list were selected comming from
    // dashboard or list views, it might have filters
    numberOfLocations = numberWithCommas(numLocations);
    listName = name;
    numberOfFiltersApplied = filterCount
      ? `| ${filterCount} filter${filterCount === 1 ? '' : 's'}`
      : '';
  } else {
    // full list was selected but it does not contain filters or specific locations selected
    numberOfLocations = numberWithCommas(selectedLists.list_locations_count);
    listName = selectedLists?.list_name;
    numberOfFiltersApplied = '';
  }
  const goToDashboard = () => {
    const request = new XMLHttpRequest();
    request.open('POST', '/dashboard/map-locations', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();
    request.onload = () => {
      if (request.response === 'return') {
        window.location = '/dashboard';
      }
    };
    request.onerror = (err) => {
      console.log(err);
    };
  };

  const goToList = (id) => {
    const selectedListIsShared =
      transitionListData &&
      userSharedLists &&
      userSharedLists.map((userSharedList) => userSharedList.id).includes(transitionListData.id);
    const addShared = selectedListIsShared ? `&shared=true` : ``;
    window.location = `/list-details?id=${id}${addShared}`;
  };

  const handleBack = () => {
    if (!isLinkToList) {
      return;
    }
    const { dashboard_map_extent } = transitionListData || {};
    gtag('event', 'Map GO TO MAP link clicked', {
      event_category: 'Map Click',
      event_label: 'User click on a GO TO MAP link',
    });
    if (dashboard_map_extent) {
      goToDashboard();
    } else {
      goToList(listId);
    }
  };

  return (
    <div className={`list-section-info ${isLinkToList ? 'link-to-list' : ''}`} onClick={handleBack}>
      <span>{`${numberOfLocations} - ${listName} ${numberOfFiltersApplied}`}</span>
    </div>
  );
}

export default SelectedListDescription;
