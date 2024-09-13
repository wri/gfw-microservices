import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import Page from '../../../common/js/components/Page';
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import httpRequest from '../../../common/js/utils/httpRequest';
import { getGFWListNameFromMapLayerId } from '../../../common/js/utils/gfw.utils';
import { proLayers } from '../../../common/js/proLayers.config';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import Landing from './landing/Landing';
import FolderDetail from './landing/FolderDetail';
import AddLocation from './adding/AddLocation';
import UploadLocations from './uploading/UploadLocations';
import AddGFW from './addGFW/AddGFW';

// Store
import store from '../store';
import { addList, changeView, changeAddType } from '../actions/locationActions';

import { resetScroll } from '../utils/scroll.utils';

import '../../css/locations.scss';
import ShareListModal from './ShareList/ShareListModal';

const { universalMillList } = proLayers;

const pageOptions = {
  links: {
    logout: true,
  },
};

class Locations extends Component {
  unloadHistory = undefined;

  constructor(props) {
    super(props);

    const locationDataString = localStorage.getItem('locationDataToAddFromMap');
    localStorage.removeItem('locationDataToAddFromMap');

    let locationDataToAddFromMap = null;
    if (locationDataString) {
      locationDataToAddFromMap = JSON.parse(locationDataString);
    }

    const isAddingLocationFromMap =
      locationDataToAddFromMap && Object.keys(locationDataToAddFromMap).length > 0;

    this.state = {
      isLoading: false,
      geomFromMap: false,
      gfwInfoFromMap: false, // will switch to an object if this is activated!
      userListInfoFromMap: false, // same as above!
      drawnGeom: false, // same as above!
      shareView: false,
      adminArea: false,
      B2BsharedListEnabled: false,
      mapData: locationDataToAddFromMap?.mapData,
      gfwData: locationDataToAddFromMap?.gfwData,
      drawData: locationDataToAddFromMap?.drawData,
      locationName: locationDataToAddFromMap?.locationName,
      isAddingLocationFromMap,
      ...store.getState(),
    };
  }

  componentDidMount() {
    resetScroll();
    this.unsubscribe = store.subscribe(this.storeDidUpdate);
    this.getGeomFromMap(this.state.isAddingLocationFromMap);
    const { history } = this.props;

    this.unloadHistory = history.listen((location, action) => {
      // Update state view on browser back.
      // Expects the URLs of all views other than the landing page to match the view name.
      if (action === 'POP') {
        const view = location.pathname.slice(1) ? location.pathname.slice(1) : 'landing';
        const goToView = view.indexOf('upload') > -1 ? 'upload' : view;
        store.dispatch(changeView(goToView));
      } else if (location.pathname === '/upload/step/1') {
        store.dispatch(changeView('upload'));
      }
    });
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

  getGeomFromMap = (isAddingLocationFromMap) => {
    const { gfwData, mapData, drawData } = this.state;

    // Handle the case where mapData is present
    if (mapData && mapData.listID && mapData.locationID) {
      this.handleMapData(isAddingLocationFromMap);
      return;
    }

    // Handle the case where gfwData is present
    if (gfwData && gfwData.listName) {
      this.handleGFWData(isAddingLocationFromMap);
      return;
    }

    // Handle the case where drawData is present
    if (drawData) {
      this.handleDrawData();
      return;
    }

    console.warn('Insufficient data to process getGeomFromMap');
  };

  handleMapData = (isAddingLocationFromMap) => {
    const { userLists, history } = this.props;
    const { mapData, locationName, drawData, gfwData } = this.state;
    const userListInfoFromMap = {
      ...gfwData,
      locationName,
      listAlias: '',
      listID: mapData.listID,
      locationID: mapData.locationID,
    };

    this.setState({ isLoading: true, userListInfoFromMap });

    if (isAddingLocationFromMap) {
      const list = userLists?.find((ul) => ul.id === mapData.listID);
      if (list) {
        this.handleDrawData(drawData, locationName);
        store.dispatch(addList(list));
        store.dispatch(changeView('add'));
        history.push('/add');
      } else {
        console.warn('Failed to find list to add to');
      }
    }
  };

  handleGFWData = (isAddingLocationFromMap) => {
    const { gfwLists } = this.props;
    const { gfwData, locationName } = this.state;
    const listName = getGFWListNameFromMapLayerId(gfwData.listName);
    const gfwInfoFromMap = {
      gfwData,
      locationName,
      listAlias: listName,
    };

    this.setState({ isLoading: true, gfwInfoFromMap });

    if (isAddingLocationFromMap) {
      const gfwList = gfwLists?.find((gfw) => gfw.list_name === listName);
      if (gfwList) {
        this.fetchGFWListData(gfwList, gfwInfoFromMap);
      } else {
        console.warn('gfwList not found');
      }
    }
  };

  handleDrawData = (drawData, locationName) => {
    if (drawData) {
      const drawnGeom = JSON.parse(drawData);
      const mapData = {
        geometry: drawnGeom,
        locationName,
      };

      this.setState({ drawnGeom: mapData, isLoading: false });
    } else {
      console.warn('Did not get draw data to use on add location page');
      this.setState({ isLoading: false });
    }
  };

  fetchGFWListData = (gfwList, gfwInfoFromMap) => {
    const { globalIds } = gfwInfoFromMap.gfwData;
    const params = `list_id=${gfwList.id}&global_ids=["${globalIds}"]`;

    httpRequest
      .fetchForm('/locations/getGFWListLocationsGlobalId', params)
      .then((response) => {
        const locations = JSON.parse(response);
        if (locations) {
          this.processGFWLocationData(locations, gfwList, gfwInfoFromMap);
        }
      })
      .catch((err) => {
        console.warn('Error fetching GFW location data', err);
        this.setState({ isLoading: false });
      });
  };

  processGFWLocationData = (locations, gfwList, gfwInfoFromMap) => {
    const data = locations.location_analyses[0][0];
    const admin = {
      substate: data['Sub State'],
      state: data.State,
      country: data.Country,
      gadmid: data.gadmid,
      adminData: data,
      gfwListID: gfwList.id,
    };

    const listId = gfwList.id;
    const locationIds = [data.location_id];

    httpRequest
      .fetchForm(
        '/locations/getGFWListLocationGeom',
        `list_id=${listId}&location_ids=${locationIds}`
      )
      .then((response) => {
        const esriGeom = geojsonUtil.geojsonToArcGIS(JSON.parse(response));
        const geometries = {
          geometry: esriGeom[0].geometry,
          locationName: gfwInfoFromMap.locationName,
        };

        this.setState({
          isLoading: false,
          drawnGeom: geometries,
          gfwInfoFromMap,
          listAlias: gfwInfoFromMap.locationName,
          adminArea: admin,
          gfwListID: gfwList.id,
        });

        this.navigateToAddView(gfwInfoFromMap, gfwList);
      })
      .catch((err) => {
        console.warn('Error fetching GFW location geometry', err);
        this.setState({ isLoading: false });
      });
  };

  navigateToAddView = (gfwInfoFromMap, gfwList) => {
    let addType = this.state.activeTemplate === 'investment' ? 'investment' : 'commodity';
    if (gfwInfoFromMap.gfwData.listName === universalMillList) {
      addType = 'commodity';
    }

    store.dispatch(changeAddType(addType));
    store.dispatch(addList(gfwList));
    store.dispatch(changeView('add'));
    this.props.history.push('/add');
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
      addType,
      addMethod,
      activeTemplate,
      userFolders,
      selectedFolder,
      selectedLists,
      canopyModalVisible,
      language,
      listData,
      filteredData,
      selectedLocations,
      gfwInfoFromMap,
      drawnGeom,
      isLoading,
      shareView,
      adminArea,
      B2BsharedListEnabled,
      geomFromMap,
    } = this.state;

    const {
      history,
      templateData,
      templateDropdowns,
      userLists,
      userInfo,
      organizationId,
      locationCount,
      orgLists,
      gfwLists,
      usersList,
      userSharedLists,
    } = this.props;

    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;

    const allLists = userLists.concat(userSharedLists);

    const showShareListModal = shareView && B2BsharedListEnabled;

    return (
      <Page links={pageOptions.links} active="locations">
        <ModalLoader open={isLoading} />
        {showShareListModal && (
          <ShareListModal
            usersList={usersList}
            selectedList={selectedList}
            isOpen={showShareListModal}
            onClose={() => this.showShareList(false)}
            currentUser={userInfo}
          />
        )}
        <Switch>
          <Route path="/add">
            <AddLocation
              gfwInfoFromMap={gfwInfoFromMap}
              adminArea={adminArea}
              organizationId={organizationId}
              geomFromMap={drawnGeom}
              templateData={templateData}
              templateDropdowns={templateDropdowns}
              userLists={userLists}
              view={view}
              addType={addType}
              addMethod={addMethod}
              activeTemplate={activeTemplate}
              orgLists={orgLists}
            />
          </Route>
          <Route path="/upload">
            <UploadLocations
              organizationId={organizationId}
              templateData={templateData}
              templateDropdowns={templateDropdowns}
              userLists={userLists}
              view={view}
              addType={addType}
              addMethod={addMethod}
              activeTemplate={activeTemplate}
              orgLists={orgLists}
            />
          </Route>
          <Route path="/folders">
            <FolderDetail
              lists={allLists}
              folders={userFolders}
              selectedFolder={selectedFolder}
              history={history}
              currentUser={userInfo}
              showShareList={this.showShareList}
            />
          </Route>
          <Route path="/gfw">
            <AddGFW
              currentUser={userInfo}
              organizationId={organizationId}
              geomFromMap={geomFromMap}
              templateData={templateData}
              templateDropdowns={templateDropdowns}
              userLists={userLists}
              view={view}
              addType={addType}
              addMethod={addMethod}
              activeTemplate={activeTemplate}
              orgLists={orgLists}
              listData={listData}
              selectedLists={selectedLists}
              selectedLocations={selectedLocations}
              filteredData={filteredData}
            />
          </Route>
          <Route>
            <Landing
              view={view}
              addType={addType}
              canopyModalVisible={canopyModalVisible}
              currentUser={userInfo}
              language={language}
              addMethod={addMethod}
              activeTemplate={activeTemplate}
              gfwLists={gfwLists}
              userFolders={userFolders}
              userLists={userLists}
              locationCount={locationCount}
              showShareList={this.showShareList}
              userSharedLists={userSharedLists}
              usersList={usersList} // Contains all users
              B2BsharedListEnabled={B2BsharedListEnabled}
            />
          </Route>
        </Switch>
      </Page>
    );
  }
}

export default withRouter(Locations);
