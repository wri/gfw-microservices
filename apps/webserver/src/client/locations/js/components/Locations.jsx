import { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import errorLogger from '../../../common/js/utils/errorLogger';

import Page from '../../../common/js/components/Page';
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import httpRequest from '../../../common/js/utils/httpRequest';
import { getGFWListNameFromMapLayerId } from '../../../common/js/utils/gfw.utils';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import Landing from './landing/Landing';
import FolderDetail from './landing/FolderDetail';

// Store
import store from '../store';
import { changeView } from '../actions/locationActions';

import { resetScroll } from '../utils/scroll.utils';

import '../../css/locations.scss';
import { UploadLocationRouter } from './newLocationUpload/UploadLocationRouter';
import { UploadLocationProvider } from './newLocationUpload/contexts';

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
      gfwInfoFromMap: false, // will switch to an object if this is activated!
      userListInfoFromMap: false, // same as above!
      drawnGeom: false, // same as above!
      adminArea: false,
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
    const { history, location } = this.props;

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

    const searchParams = new URLSearchParams(location.search);
    const redirectTo = searchParams.get('redirectTo');
    const fromList = searchParams.get('fromList');

    if (redirectTo) {
      history.replace(`/${redirectTo}`);
      if (fromList) {
        const parsedFromList = Number(fromList);
        if (!isNaN(parsedFromList)) {
          this.setState({ fromList: parsedFromList });
        }
      }
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    if (this.unloadHistory) {
      this.unloadHistory();
    }
  }

  storeDidUpdate = () => {
    const { view, userFolders, selectedFolder, canopyModalVisible, language } = store.getState();
    const prev = this.state;
    if (
      view !== prev.view ||
      userFolders !== prev.userFolders ||
      selectedFolder !== prev.selectedFolder ||
      canopyModalVisible !== prev.canopyModalVisible ||
      language !== prev.language
    ) {
      this.setState({ view, userFolders, selectedFolder, canopyModalVisible, language });
    }
  };

  getGeomFromMap = (isAddingLocationFromMap) => {
    const { gfwData, mapData, drawData, locationName } = this.state;

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
      this.handleDrawData(drawData, locationName);
      return;
    }

    errorLogger.warn('Insufficient data to process getGeomFromMap', {
      component: 'Locations',
      hasMapData: !!mapData,
      hasGfwData: !!gfwData,
      hasDrawData: !!drawData,
    });
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
        const drawnGeom = JSON.parse(drawData);
        const finalMapData = {
          geometry: drawnGeom,
          locationName,
        };
        this.setState({ drawnGeom: finalMapData, isLoading: false });
        history.replace('/upload-location/by-polygon');
      } else {
        errorLogger.warn('Failed to find list to add to', {
          component: 'Locations',
          listID: mapData.listID,
          userListsCount: userLists?.length,
        });
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
        errorLogger.warn('gfwList not found', {
          component: 'Locations',
          listName,
          gfwListsCount: gfwLists?.length,
        });
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

      this.props.history.replace('/upload-location/by-polygon');
    } else {
      errorLogger.warn('Did not get draw data to use on add location page', {
        component: 'Locations',
        locationName,
      });
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
        errorLogger.warn('Error fetching GFW location data', {
          component: 'Locations',
          action: 'fetchGFWListData',
          error: err,
          gfwListId: gfwList.id,
        });
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

        this.props.history.replace('/upload-location/by-polygon');
      })
      .catch((err) => {
        errorLogger.warn('Error fetching GFW location geometry', {
          component: 'Locations',
          action: 'processGFWLocationData',
          error: err,
          listId,
          locationIds,
        });
        this.setState({ isLoading: false });
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
      canopyModalVisible,
      language,
      drawnGeom,
      isLoading,
      fromList,
    } = this.state;

    const { history, userLists, userInfo, locationCount, gfwLists, userSharedLists } = this.props;

    const allLists = userLists.concat(userSharedLists);

    return (
      <Page links={pageOptions.links} active="locations">
        <ModalLoader open={isLoading} />
        <Switch>
          <Route path="/folders">
            <FolderDetail
              lists={allLists}
              folders={userFolders}
              selectedFolder={selectedFolder}
              history={history}
              currentUser={userInfo}
            />
          </Route>
          <Route path="/upload-location">
            <UploadLocationProvider>
              <UploadLocationRouter
                userLists={userLists}
                geoFromMap={drawnGeom}
                fromList={fromList}
              />
            </UploadLocationProvider>
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
              userSharedLists={userSharedLists}
            />
          </Route>
        </Switch>
      </Page>
    );
  }
}

export default withRouter(Locations);
