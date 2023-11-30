import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Page from '../../../common/js/components/Page';
import { userAccessLevel } from '../../../common/js/config';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import EditList from './edit/EditList';
import onListFromViewToList from '../utils/redirect';

// Store
import store from '../../../locations/js/store';
import Lists from './lists/Lists';

import '../../../locations/css/locations.scss';
import { getIsDiagnosticStatusDraft } from '../utils/draft.utils';

const pageOptions = {
  links: {
    logout: true,
  },
};

class Locations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      gfwInfoFromMap: false, // will switch to an object if this is activated!
      userListInfoFromMap: false, // same as above!
      drawnGeom: false, // same as above!
      shareView: false,
      ...store.getState(),
    };
  }

  componentDidMount() {
    const { location, userLists, gfwLists, canopyModalVisible } = this.props;

    this.unsubscribe = store.subscribe(this.storeDidUpdate);

    const { locationName, fromMap, userSharedLists } = this.props;

    let listToRedirect;
    const redirectedFromMap = fromMap && locationName;
    const locationIdSearch = parseInt(new URLSearchParams(location.search).get('id'));
    const isGfwList = JSON.parse(new URLSearchParams(location.search).get('gfw'));
    const isSharedList = JSON.parse(new URLSearchParams(location.search).get('shared'));

    if (locationIdSearch) {
      const listToSearch = isGfwList ? gfwLists : isSharedList ? userSharedLists : userLists;
      listToRedirect = listToSearch?.find((listData) => listData.id === locationIdSearch);
    } else if (redirectedFromMap) {
      const userList = userLists.find((userList) => userList.list_name === locationName);
      listToRedirect =
        userList || (dashList = gfwLists.find((gfwList) => gfwList.list_name === locationName));
    }
    console.log(listToRedirect);
    if (listToRedirect) {
      onListFromViewToList(listToRedirect, canopyModalVisible);
      this.setState({ isLoading: false });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();

    if (this.unloadHistory) {
      this.unloadHistory();
    }
  }

  storeDidUpdate = () => {
    this.setState(store.getState());
  };

  getCurrentLists = () => {
    return this.state.selectedLists;
  };

  stopLoading = () => {
    this.setState({
      isLoading: false,
    });
  };

  showShareList = (show) => {
    if (show) {
      gtag('event', 'Back to list view link clicked', {
        event_category: 'Sharing',
        event_label: 'user clicked on the back to list view link from the sharing page',
      });
    } else {
      gtag('event', 'list table share', {
        event_category: 'Lists Click',
        event_label: 'user clicked share list',
      });
    }
    this.setState({
      shareView: show,
    });
  };

  render() {
    const {
      view,
      listView,
      addType,
      activeTemplate,
      userFolders,
      selectedLists,
      canopyModalVisible,
      filters,
      filterCount,
      listData,
      filteredData,
      listLevelAnalysis,
      selectedLocations,
      selectedAndVisibleLocations,
      infoBubbleCache,
      gfwInfoFromMap,
      userListInfoFromMap,
      popover: { displayPopover, bubbleData, popoverLoading, anchorEl },
      isLoading,
      shareView,
    } = this.state;

    const {
      history,
      templateData,

      userLists,
      userInfo,
      organizationId,
      locationCount,
      gfwLists,
      usersList,
      userSharedLists,
    } = this.props;

    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;
    let draftNonOwner = false;
    if (selectedList) {
      const userIsAdmin = userInfo.access_level_id === userAccessLevel.ADMIN;
      const userIsOwner = userInfo.id === selectedList.user_id;
      draftNonOwner = !userIsAdmin && !userIsOwner;
    }

    const filteredLocationData = listData
      .filter((listD) => filteredData.indexOf(listD.location_id) > -1)
      .map((loc) => {
        return {
          ...loc,
          draftNonOwner,
        };
      });

    const selectedLocationData =
      filteredLocationData.length > 0 && selectedLocations.length > 0
        ? filteredLocationData.filter((feat) => selectedLocations.indexOf(feat.location_id) > -1)
        : filteredLocationData;

    return (
      <Page links={pageOptions.links} active="locations">
        <ModalLoader open={isLoading} />
        <Switch>
          <Route path="/edit">
            <EditList
              history={history}
              organizationId={organizationId}
              templateData={templateData}
              userLists={userLists}
              view={view}
              addType={addType}
              activeTemplate={activeTemplate}
              listData={listData}
              selectedLists={selectedLists}
              selectedLocationData={selectedLocationData}
              selectedLocations={
                selectedLocations.length && selectedAndVisibleLocations.length > 0
                  ? selectedAndVisibleLocations
                  : selectedLocations
              }
              filteredData={filteredData}
            />
          </Route>
          <Route>
            {!isLoading && (
              <Lists
                activeTemplate={activeTemplate}
                addType={addType}
                gfwInfoFromMap={gfwInfoFromMap}
                history={history}
                userListInfoFromMap={userListInfoFromMap}
                organizationId={organizationId}
                currentUser={userInfo}
                selectedLists={selectedLists}
                folders={userFolders}
                userLists={userLists} // Contains all lists that users have created
                view={view}
                listView={listView}
                locationCount={locationCount}
                gfwLists={gfwLists}
                canopyModalVisible={canopyModalVisible}
                listLevelAnalysis={listLevelAnalysis}
                filters={filters}
                filterCount={filterCount}
                getCurrentLists={this.getCurrentLists}
                listData={listData}
                filteredData={filteredData}
                filteredLocationData={filteredLocationData}
                selectedLocations={selectedLocations}
                selectedAndVisibleLocations={selectedAndVisibleLocations}
                templateData={templateData}
                displayPopover={displayPopover}
                bubbleData={bubbleData}
                popoverLoading={popoverLoading}
                anchorEl={anchorEl}
                infoBubbleCache={infoBubbleCache}
                stopLoading={this.stopLoading}
                usersList={usersList} // Contains all users
                userSharedLists={userSharedLists}
                shareView={shareView}
                showShareList={this.showShareList}
                isDiagnosticStatusDraft={getIsDiagnosticStatusDraft(...selectedLists)}
              />
            )}
          </Route>
        </Switch>
      </Page>
    );
  }
}

export default withRouter(Locations);
