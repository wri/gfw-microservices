import React from 'react';
import ListPanel from './ListPanel';
import SelectedListDescription from './SelectedListDescription';
import '../../../../map/css/controlPanel.scss';

function ListSection({
  locationCount,
  userLists,
  gfwLists,
  selectedLists = {},
  view,
  selectedListCallback,
  transitionListData = {},
  userSharedLists,
  listContext,
  currentUser,
}) {
  return (
    <div className="list-section__subnavigation">
      <div className="list-section-show-container">
        <ListPanel
          locationCount={locationCount}
          selectedList={selectedLists}
          selectedListCallback={selectedListCallback}
          view={view}
          userLists={userLists}
          gfwLists={gfwLists}
          userSharedLists={userSharedLists}
          listContext={listContext}
          currentUser={currentUser}
        />
        <SelectedListDescription
          totalNumberOfLocationsInAccount={locationCount?.TotalCount}
          currentView={listContext}
          selectedLists={selectedLists}
          transitionListData={transitionListData}
          userSharedLists={userSharedLists}
        />
      </div>
    </div>
  );
}

export default ListSection;
