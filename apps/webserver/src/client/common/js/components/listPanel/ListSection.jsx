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
  userSharedLists,
  currentUser,
  selectedLocationName,
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
          currentUser={currentUser}
        />
        <SelectedListDescription
          totalNumberOfLocationsInAccount={locationCount?.TotalCount}
          userSharedLists={userSharedLists}
          selectedLocationName={selectedLocationName}
        />
      </div>
    </div>
  );
}

export default ListSection;
