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
  const redirectToAlerts = !!transitionListData?.alertsMapExtent;
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
          userSharedLists={userSharedLists}
          redirectToAlerts={redirectToAlerts}
          listContext={listContext}
        />
      </div>
    </div>
  );
}

export default ListSection;
