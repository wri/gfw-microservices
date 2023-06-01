import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import Page from '../../../common/js/components/Page';
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import httpRequest from '../../../common/js/utils/httpRequest';
import GFW_LIST_NAME from '../../../common/js/constants/lists.constants';
import { proLayers, userAccessLevel } from '../../../common/js/config';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import Landing from './landing/Landing';
import FolderDetail from './landing/FolderDetail';
import AddLocation from './adding/AddLocation';
import UploadLocations from './uploading/UploadLocations';
import EditList from './edit/EditList';
import AddGFW from './addGFW/AddGFW';
import Diagnostics from './diagnostics/Diagnostics';
import onListFromViewToList from '../utils/redirect';

// Store
import store from '../store';
import { addList, changeView, changeAddType } from '../actions/locationActions';

import Lists from './lists/Lists';
import { resetScroll } from '../utils/scroll.utils';

import '../../css/locations.scss';
import { getIsDiagnosticStatusDraft } from '../utils/draft.utils';
import ShareListModal from './ShareList/ShareListModal';

const { protectedAreas, rspoConcessions, oilPalmConcessions, adminAreas, universalMillList } =
  proLayers;

const pageOptions = {
  links: {
    logout: true,
  },
};

class Locations extends Component {
  unloadHistory = undefined;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      geomFromMap: false,
      gfwInfoFromMap: false, // will switch to an object if this is activated!
      userListInfoFromMap: false, // same as above!
      drawnGeom: false, // same as above!
      shareView: false,
      adminArea: false,
      B2BsharedListEnabled: false,
      ...store.getState(),
    };
  }

  componentDidMount() {
    const { location, goToEditList, userLists, gfwLists, canopyModalVisible } = this.props;
    resetScroll();
    this.unsubscribe = store.subscribe(this.storeDidUpdate);
    this.getGeomFromMap(goToEditList);
    const { history, locationName, fromMap, userSharedLists } = this.props;

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

    if (listToRedirect) {
      onListFromViewToList(listToRedirect, canopyModalVisible, history);
    }

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

  getGeomFromMap = (goToEditList) => {
    const { gfwData, mapData, locationName, userLists, drawData, gfwLists } = this.props;
    let listName = '';
    if (mapData) {
      // TODO: What exactly is mapData?
      const userListInfoFromMap = {
        gfwData,
        locationName,
        listAlias: listName,
        listID: mapData.listID,
        locationID: mapData.locationID,
      };

      this.setState({
        isLoading: true,
        userListInfoFromMap,
      });

      // Load the list to be edited
      if (goToEditList) {
        const list = userLists.find((ul) => ul.id === mapData.listID);
        if (list) {
          // use selected location geography as a custom shape
          if (drawData) {
            this.setState({
              drawnGeom: {
                geometry: JSON.parse(drawData),
                locationName,
              },
              isLoading: false,
            });
          } else {
            console.warn('did not get draw data to use on add location page');
            this.setState({ isLoading: false });
          }
          store.dispatch(addList(list));
          store.dispatch(changeView('add'));
          const { history } = this.props;
          history.push('/add');
        } else {
          console.warn('failed to find list to add to');
          this.setState({ isLoading: false });
        }
      }
    } else if (gfwData && gfwData.listName) {
      // GFW Lists: listName, globalIds >> rspo/protected and so on goes here
      listName = GFW_LIST_NAME[gfwData.listName];

      const gfwInfoFromMap = {
        gfwData,
        locationName,
        listAlias: listName,
      };

      if (goToEditList) {
        this.setState({ isLoading: true });
        const gfwList = gfwLists.find((gfw) => {
          return gfw.list_name === listName;
        });

        // Fetch the GFW list location ID and admin area data
        const { globalIds } = gfwInfoFromMap.gfwData;

        // We know that these lists for sure do not require last character slice modification, but we are keeping the old logic also
        // to prevent undesirable regressions
        let updatedGlobalIds = [];
        const gfwTestedList = [
          universalMillList,
          oilPalmConcessions,
          rspoConcessions,
          protectedAreas,
          adminAreas,
        ];
        if (gfwTestedList.includes(listName)) {
          updatedGlobalIds = globalIds;
        } else {
          updatedGlobalIds = [1, 2, 3].includes(gfwList.id) ? globalIds : globalIds.map((id) => id);
        }

        const params = `list_id=${gfwList.id}&global_ids=["${updatedGlobalIds}"]`;
        httpRequest
          .fetchForm('/locations/getGFWListLocationsGlobalId', params)
          .then((response) => {
            const locations = JSON.parse(response);
            if (locations) {
              const data = locations.location_analyses[0][0];
              const admin = {
                substate: data['Sub State'],
                state: data.State,
                country: data.Country,
                gadmid: data.gadmid,
                adminData: data,
                gfwListID: gfwList ? gfwList.id : null,
              };

              const listId = gfwList.id;
              const locationIds = [data.location_id];

              // Fetch the bounds for the admin area
              httpRequest
                .fetchForm(
                  '/locations/getGFWListLocationGeom',
                  `list_id=${listId}&location_ids=${locationIds}`
                )
                .then((response) => {
                  // convert GeoJSON admin bounds to ESRI JSON format for map
                  const esriGeom = geojsonUtil.geojsonToArcGIS(JSON.parse(response));
                  const geometries = { geometry: esriGeom[0].geometry, locationName };
                  this.setState({
                    isLoading: false,
                    drawnGeom: geometries,
                    gfwInfoFromMap,
                    listAlias: locationName,
                    adminArea: admin,
                    gfwListID: gfwList ? gfwList.id : null,
                  });

                  // Add type overrides based on which listName (RSPO, UML, WDPA, etc) we are working with
                  let addType =
                    this.state.activeTemplate === 'investment' ? 'investment' : 'commodity';
                  if (gfwInfoFromMap && gfwInfoFromMap.gfwData.listName === universalMillList) {
                    addType = 'commodity';
                  }
                  store.dispatch(changeAddType(addType));
                  store.dispatch(addList(gfwList));
                  store.dispatch(changeView('add'));
                  const { history } = this.props;
                  history.push('/add');
                })
                .catch((err) => {
                  console.warn('error fetching gfw location geometry', err);
                  this.setState({ isLoading: false });
                });
            }
          })
          .catch((err) => {
            console.warn('error fetching gfw location data', err);
            this.setState({ isLoading: false });
          });
      } else {
        this.setState({
          isLoading: true,
          gfwInfoFromMap,
        });
      }
    } else if (drawData) {
      // Drawn/Uploaded poly: geoString
      const drawnGeom = JSON.parse(drawData);

      const mapData = {
        geometry: drawnGeom,
        locationName,
      };

      this.setState({ drawnGeom: mapData });
      store.dispatch(changeView('add'));
      const { history } = this.props;
      history.push('/add');
    }
  };

  stopLoading = () => {
    this.setState({
      isLoading: false,
    });
  };

  showShareList = (show) => {
    if (show) {
      gtag('event', 'Back to list view link clicked', {
        ''event_category'': 'Sharing',
        ''event_label'': 'user clicked on the back to list view link from the sharing page',
      });
    } else {
      gtag('event', 'list table share', {
        ''event_category'': 'Lists Click',
        ''event_label'': 'user clicked share list',
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
      addMethod,
      activeTemplate,
      userFolders,
      selectedFolder,
      selectedLists,
      canopyModalVisible,
      filters,
      filterCount,
      language,
      listData,
      filteredData,
      listLevelAnalysis,
      selectedLocations,
      selectedAndVisibleLocations,
      spatialData,
      infoBubbleCache,
      gfwInfoFromMap,
      userListInfoFromMap,
      drawnGeom,
      popover: { displayPopover, bubbleData, popoverLoading, anchorEl },
      diagnosticView,
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
          <Route path="/edit">
            <EditList
              history={history}
              organizationId={organizationId}
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
              selectedLocationData={selectedLocationData}
              selectedLocations={
                selectedLocations.length && selectedAndVisibleLocations.length > 0
                  ? selectedAndVisibleLocations
                  : selectedLocations
              }
              filteredData={filteredData}
            />
          </Route>
          <Route path="/diagnostics">
            <Diagnostics
              history={history}
              diagnosticView={diagnosticView}
              organizationId={organizationId}
              currentUser={userInfo}
              view={view}
              listView={listView}
              activeTemplate={activeTemplate}
              selectedLists={selectedLists}
              listData={listData}
              filteredData={filteredData}
              listLevelAnalysis={listLevelAnalysis}
              spatialData={spatialData}
              selectedLocations={selectedLocations}
              infoBubbleCache={infoBubbleCache}
              displayPopover={displayPopover}
              bubbleData={bubbleData}
              popoverLoading={popoverLoading}
              anchorEl={anchorEl}
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
          <Route path="/lists">
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
