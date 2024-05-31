import React from 'react';
import { numberWithCommas } from '../../../../locations/js/utils/locationsTableUtils';

function SelectedListDescription({
  selectedLists = {},
  transitionListData = {},
  totalNumberOfLocationsInAccount = 0,
  userSharedLists = {},
}) {
  // list data comming from previous view (dashboard or list view)
  const { name, numLocations } = transitionListData;
  const listId = selectedLists?.id || transitionListData?.id;
  const isListSelected =
    Object.keys(selectedLists).length || Object.keys(transitionListData).length;

  // if a list is selected and we are in the map view, make it a link
  const isLinkToList = isListSelected;

  let numberOfLocations;
  let listName;

  if (!isListSelected) {
    // no list was selected, show total number of locations
    numberOfLocations = numberWithCommas(totalNumberOfLocationsInAccount);
    listName = 'All Locations';
  } else if (Object.keys(transitionListData).length) {
    // full list or specific locations from a list were selected comming from
    // dashboard or list views
    numberOfLocations = numberWithCommas(numLocations);
    listName = name;
  } else {
    // full list was selected but it does not contain specific locations selected
    numberOfLocations = numberWithCommas(selectedLists.list_locations_count);
    listName = selectedLists?.list_name;
  }
  const goToDashboard = () => {
    // TODO: use get params
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
    const { isGfwList } = transitionListData;
    const selectedListIsShared =
      transitionListData &&
      userSharedLists &&
      userSharedLists.map((userSharedList) => userSharedList.id).includes(transitionListData.id);
    const addShared = selectedListIsShared ? `&shared=true` : ``;
    const gfwListFlag = isGfwList ? '&gfw=true' : '';

    window.location = `/list-details?id=${id}${addShared}${gfwListFlag}`;
  };

  const handleBack = () => {
    if (!isLinkToList) {
      return;
    }
    const { alertsMapExtent } = transitionListData || {};
    gtag('event', 'Map GO TO MAP link clicked', {
      event_category: 'Map Click',
      event_label: 'User click on a GO TO MAP link',
    });
    if (alertsMapExtent) {
      goToDashboard();
    } else {
      goToList(listId);
    }
  };

  return (
    <div className={`list-section-info ${isLinkToList ? 'link-to-list' : ''}`} onClick={handleBack}>
      <span>{`${numberOfLocations} - ${listName}`}</span>
    </div>
  );
}

export default SelectedListDescription;
