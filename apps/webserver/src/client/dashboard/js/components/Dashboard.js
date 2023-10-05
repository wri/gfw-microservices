import Page from '../../../common/js/components/Page';
import React, { Component } from 'react';
import moment from 'moment';
import Dialog from 'material-ui/Dialog';
import ReportIcon from 'material-ui/svg-icons/action/description';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import isEmpty from 'lodash/isEmpty';

import store from '../store';
import {
  addListCache,
  incrementZoomLevel,
  saveAccessLevel,
  saveGFWLists,
  saveLocationCount,
  saveRawData,
  saveUserLists,
  selectAdmin,
  selectAlert,
  selectList,
  selectTimeframe,
  setZoomLevelTotal,
  toggleDialog,
  toggleLoader,
  updateLocationFilter,
} from '../actions/dashboardActions';

import Button from '../../../common/js/components/Button';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import SubHeader from '../../../common/js/components/SubHeader';
import ListSection from '../../../common/js/components/listPanel/ListSection';
import DashboardMap from './DashboardMap';
import DashboardFooter from './DashboardFooter';
import DashboardSettings from './DashboardSettings';
import { downloadDashboard } from '../utils/csvUtils';
import { numberWithCommas } from '../../../locations/js/utils/locationsTableUtils';
import { loaderMessages } from '../../../common/js/config';
import { gfwListNames } from '../../../common/js/constants/lists.constants';

//TODO Remove temp file
// import { data } from './old';
import fetch from '../../../common/js/utils/fetch';

import '../../css/dashboard.scss';

const pageOptions = {
  links: {
    logout: true,
  },
};

function formatDates(dateString) {
  if (dateString === '{}') return [];
  let dayStr = dateString.replace(/{|}/gim, '');
  dayStr = dayStr.split(',');
  dayStr = dayStr.map((s) => {
    const dayCountSplit = s.split(':');
    return {
      day: JSON.parse(dayCountSplit[0]),
      count: Number(dayCountSplit[1]),
    };
  });
  return dayStr;
}

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    const { userLists, accessLevel, locationCount, gfwLists } = props;
    store.dispatch(saveUserLists(userLists));
    store.dispatch(saveGFWLists(gfwLists.map((list) => ({ ...list, GFWList: true }))));
    store.dispatch(saveAccessLevel(accessLevel));
    store.dispatch(saveLocationCount(locationCount));
    this.state = {
      ...store.getState(),
      lastUpdatedDashboard: 'N/A',
    };
  }

  componentDidMount() {
    // Load the user's map options from local storage If they came directly from the map
    if (this.props.fromMap && window.localStorage.getItem('GFW')) {
      const cachedMap = JSON.parse(window.localStorage.getItem('GFW'));

      if (cachedMap) {
        const {
          selectedList,
          selectedAdmin,
          locationFilters,
          selectedTimeframe,
          selectedAlert,
          zoomLevel,
          gfwList,
        } = cachedMap;
        // Cached List Id to pull from redis
        if (selectedList) {
          let listToSelect;

          if (gfwList) {
            listToSelect = this.state.gfwLists.find((sharedList) => sharedList.id === selectedList);
          } else {
            listToSelect = store
              .getState()
              .userLists.find((userList) => userList.id === selectedList);
            if (!listToSelect) {
              listToSelect = this.props.userSharedLists.find(
                (sharedList) => sharedList.id === selectedList
              );
            }
          }

          if (listToSelect) {
            this.selectList(listToSelect);
          }
        }
        // Cached selected admin to track zoomed-in locations
        if (selectedAdmin) {
          store.dispatch(selectAdmin(selectedAdmin));
        }

        // Zoom in to the proper level.
        if (zoomLevel) {
          for (let repeat = 0; repeat < zoomLevel; repeat++) {
            store.dispatch(incrementZoomLevel());
          }
        }

        // Alerts or No Alerts checkboxes on the map.
        if (locationFilters) {
          store.dispatch(updateLocationFilter(locationFilters));
        }

        // Viirs or Glaad
        if (selectedAlert) {
          store.dispatch(selectAlert(selectedAlert));
        }

        // This needs to be called after selectAlert because the selectAlert will reset the timeframe to the first option.
        if (selectedTimeframe) {
          store.dispatch(selectTimeframe(selectedTimeframe));
        }
      }
    }

    this.unsubscribe = store.subscribe(this.storeDidUpdate);
    gtag('event', 'Dashboard page loaded', {
      event_category: 'Dashboard Load',
      event_label:
        'user navigated to the Dashboard page by clicking on Dashboard link in navigation',
    });
  }

  storeDidUpdate = () => {
    const currStore = store.getState();
    this.setState(currStore);

    // Whenever the map state changes, we update the local storage to include the most recent changes.
    // If a user should navigate away and click the back button, we want to be able to display the same content that was visible before they left the page.
    const selectedListId = currStore.selectedList.id ? currStore.selectedList.id : null;

    const newStore = {
      gfwList:
        currStore.selectedList &&
        gfwListNames.indexOf(currStore.selectedList.list_name) > -1 &&
        !currStore.selectedList.template_id,
      selectedAlert: currStore.selectedAlert,
      selectedTimeframe: currStore.selectedTimeframe,
      selectedList: selectedListId,
      locationFilters: currStore.locationFilters,
      zoomLevel: currStore.zoomLevel,
      selectedAdmin: currStore.selectedAdmin,
    };

    window.localStorage.setItem('GFW', JSON.stringify(newStore));
  };

  componentWillUnmount() {
    this.unsubscribe();
  }

  selectList = async (list) => {
    const { listCache, gfwLists } = this.state;
    const { id, list_name, GFWList } = list;
    const key = `${list_name}-${id}`;

    // use cache
    if (listCache.hasOwnProperty(key)) {
      const cachedData = listCache[key];
      store.dispatch(selectList(list));
      store.dispatch(saveRawData(cachedData));
      store.dispatch(setZoomLevelTotal(cachedData.geojson.features.length));
    } else {
      store.dispatch(toggleLoader());

      //2. save list selection
      store.dispatch(selectList(list));

      //3. query DB for dashboard data
      //if list is gfw list, url is "getGFWListDashboardData"
      const gfwListIds = [2, 3, 5];
      const isGFWList = gfwListIds.includes(id) && GFWList;
      const DASHBOARD_DATA_URL = isGFWList
        ? '/dashboard/getGFWListDashboardData'
        : '/dashboard/getDashboardData';
      const DASHBOARD_TIMESTAMP_URL = isGFWList
        ? '/dashboard/getGFWListDashboardTimestamp'
        : '/dashboard/getListDashboardTimestamp';

      try {
        const listDashboardData = await fetch({
          url: DASHBOARD_DATA_URL,
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: { list_id: id },
        });

        const listDashboardTimestamp = await fetch({
          url: DASHBOARD_TIMESTAMP_URL,
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: { list_id: id },
        });

        if (
          !listDashboardTimestamp.hasOwnProperty('errorCode') &&
          listDashboardTimestamp.length !== 0
        ) {
          const formatTimestamp = moment(listDashboardTimestamp[0].dashboard_last_results).format(
            'D MMMM YYYY, h:mm A'
          );
          this.setState({ lastUpdatedDashboard: formatTimestamp });
        }

        const modDashData = listDashboardData
          .filter((l) => l.gadmid)
          .map((l) => {
            return {
              geometry: {},
              type: 'Feature',
              properties: {
                ...l,
                fire: formatDates(l.viirs_alerts_daily),
                fireAlerts: true, //this seems to denote coverage of fire alerts and it should always be true.
                gladAlerts: l.gladAlerts.trim().toLowerCase() === 'true',
                glad_alerts_daily: formatDates(l.glad_alerts_daily),
                glad_alerts_weekly: formatDates(l.glad_alerts_weekly),
                glad_alerts_monthly: formatDates(l.glad_alerts_monthly),
                viirs_alerts_daily: formatDates(l.viirs_alerts_daily),
                umd: l.tree_cover_extent_total || 0,
              },
            };
          });
        const diss = modDashData.filter((l) => l.properties.location_id === -1);
        const geo = modDashData.filter((l) => l.properties.location_id !== -1);
        const rawDataObject = {
          failedGeoJSON: { features: [] },
          dissolvedGeoJSON: { features: diss },
          geojson: { features: geo },
        };
        console.log(rawDataObject);

        const cache = {};
        cache[key] = rawDataObject;
        store.dispatch(addListCache(cache));
        store.dispatch(saveRawData(rawDataObject));
        store.dispatch(setZoomLevelTotal(rawDataObject.geojson.features.length));
        store.dispatch(toggleLoader());

        gtag('event', 'List from Show Lists dropdown clicked', {
          event_category: 'Dashboard Click',
          event_label: 'user clicked on a list from Show Lists to analyze',
        });
      } catch (e) {
        store.dispatch(
          toggleDialog({
            title: `${list_name} alerts failed to load `,
            body: 'Please select the list to try loading alerts again. If alerts continue to fail, email <a href="mailto:GFWPROsupport@wri.org">GFWPROsupport@wri.org</a> for assistance.',
          })
        );
      }
    }
  };

  printReport = () => {
    gtag('event', 'Report button clicked', {
      event_category: 'Dashboard Click',
      event_label: 'user printed dashboard report',
    });
    window.print();
  };

  render() {
    const {
      data,
      rawData,
      userLists,
      gfwLists,
      selectedAlert,
      selectedTimeframe,
      selectedList,
      mapTitle,
      locationFilters,
      view,
      map,
      zoomLevel,
      zoomLevelTotal,
      showLoader,
      showDialog,
      dialogContent,
      infoBubbleCache,
      locationCount,
      timeframeGeojson,
      timeframeDissolved,
      timeframeGeojsonForFooter,
    } = this.state;

    const dashboardTitle = isEmpty(selectedList)
      ? 'Select a list to begin dashboard analysis'
      : `Dashboard ${numberWithCommas(selectedList.list_locations_count)} Locations`;

    const { userSharedLists } = this.props;

    return (
      <Page links={pageOptions.links} active="dashboard">
        <Dialog
          paperClassName="dialog-paper Dashboard__dialog"
          open={showDialog}
          title={dialogContent.title}
          actions={[
            <Button
              variant="primary"
              label="OK"
              keyboardFocused={true}
              onClick={() => store.dispatch(toggleDialog({}))}
            />,
          ]}
        >
          <p
            className="dangerous-dialog"
            dangerouslySetInnerHTML={{ __html: dialogContent.body }}
          ></p>
        </Dialog>

        <ModalLoader
          open={showDialog ? false : showLoader}
          showMessage={true}
          header={`Loading ${selectedList.list_name} alerts`}
          message={loaderMessages.dashboardMessage}
        />

        <ModalLoader
          open={selectedList.list_status_id === 5}
          showMessage={true}
          showSpinner={false}
          header={'Dashboard is updating. Please revisit in 15 mins.'}
        />

        <SubHeader
          header={dashboardTitle}
          headerClassname="dashboard-header"
          titleTextClassname="dashboard-header__text"
        />

        <div className="dashboard-subnav">
          <div className="dashboard-body flex-grid space-between align-center">
            <ListSection
              userLists={userLists}
              gfwLists={gfwLists}
              locationCount={locationCount}
              selectedLists={selectedList}
              selectedListCallback={this.selectList}
              userSharedLists={userSharedLists}
              listContext={'dashboard'}
              currentUser={this.props.userInfo}
            />
            <div className="dashboard-subnav__controls">
              <div style={{ cursor: 'auto' }}>
                <span>{`Last updated: ${this.state.lastUpdatedDashboard} GMT`}</span>
              </div>
              <div onClick={() => this.printReport()}>
                <ReportIcon color="#b9b9bb" />
                <span>Report</span>
              </div>
              <div
                className={`${isEmpty(rawData) ? 'hidden' : ''}`}
                onClick={() => downloadDashboard()}
              >
                <DownloadIcon color="#b9b9bb" />
                <span>Download</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-body">
          <div>
            <DashboardSettings
              gfwLists={gfwLists}
              selectedAlert={selectedAlert}
              selectedList={selectedList}
              selectedTimeframe={selectedTimeframe}
              locationFilters={locationFilters}
              zoomLevel={zoomLevel}
              geoJSON={rawData.geojson}
              failedGeoJSON={rawData.failedGeoJSON}
              filteredLocationGeoJSON={timeframeGeojson}
              filteredDissolvedGeoJSON={timeframeDissolved}
            />
            <DashboardMap
              map={map}
              view={view}
              data={data}
              rawData={rawData}
              mapTitle={mapTitle}
              zoomLevel={zoomLevel}
              zoomLevelTotal={zoomLevelTotal}
              selectedAlert={selectedAlert}
              locationFilters={locationFilters}
              selectedTimeframe={selectedTimeframe}
              infoBubbleCache={infoBubbleCache}
              filteredLocationGeoJSON={timeframeGeojson}
            />
            {isEmpty(rawData) ? null : (
              <DashboardFooter
                selectedList={selectedList}
                rawData={rawData}
                locationFilters={locationFilters}
                selectedAlert={selectedAlert}
                selectedTimeframe={selectedTimeframe}
                filteredDissolvedGeoJSON={timeframeDissolved}
                filteredLocationGeoJSON={timeframeGeojsonForFooter}
              />
            )}
          </div>
        </div>
      </Page>
    );
  }
}
