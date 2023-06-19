/* eslint-disable react/no-unused-state */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Deferred from 'dojo/Deferred';
import EsriMap from 'esri/Map';
import MapView from 'esri/views/MapView';
import Graphic from 'esri/Graphic';
import Polygon from 'esri/geometry/Polygon';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import esriConfig from 'esri/config';

import TreeCoverLossLayer from '../../../../map/js/layers/TreeCoverLossLayer';
import store from '../../store';
import {
  changeListView,
  changeView,
  selectFolder,
  updateInfoBubbleCache,
} from '../../actions/locationActions';
import SensitiveAreas from './SensitiveAreas';
import SouthAmericaRegions from './SouthAmericaRegions';
import SoutheastAsiaRegions from './SoutheastAsiaRegions';
import DeforestationTrends from './DeforestationTrends';
import MillPrioritySummary from './MillPrioritySummary';
import PalmRiskAnalysis from './PalmRiskAnalysis';
import PalmRiskList from './PalmRiskList';
import InfoBubbleContent from '../../../../common/js/components/InfoBubbleContent';
import IconButtonWrapper from '../IconButtonWrapper';
import ModalLoader from '../../../../common/js/components/Loaders/ModalLoader';
import Breadcrumbs from '../../../../common/js/components/Breadcrumbs';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import IconReport from '../../../../common/js/components/icon/IconReport';
import IconDownload from '../../../../common/js/components/icon/IconDownload';
import GfwSelect from '../../../../common/js/components/GfwSelect';
import SingleLocationDiagnosticsHeaderInfo from './DiagnosticsHeaderInfo/SingleLocationDiagnosticsHeaderInfo';
import FullListDiagnosticsHeaderInfo from './DiagnosticsHeaderInfo/FullListDiagnosticsHeaderInfo';
import ConfirmDialog from '../lists/download/confirmDialog';
import downloadRequest from '../lists/download/downloadRequest';

// Utils
import geojsonUtil from '../../../../common/js/utils/arcgis-to-geojson';
import httpRequest from '../../../../common/js/utils/httpRequest';
import redirectToPage from '../../../../common/js/utils/redirect';
import { closePopover } from '../../utils/togglePopover';
import { formatNum, formatPct, prettifyNum, validatePct } from '../../utils/diagnostics.utils';
import {
  checkValidViewCommodity,
  getGFWListLocationIDs,
  getGfwListName,
} from '../../utils/lists.utils';
import { handleUserListLocationsVectorTileLayer } from '../../../../common/js/userListLocations/utils/userListLocations.util';
import { generateCentroidGraphic } from '../../../../common/js/utils/esri.utils';
import {
  handleGfwProListVectorTileLayer,
  isGfwList,
  discernGfwID,
} from '../../../../common/js/utils/gfw.utils';

// Configs
import {
  DATA_API_URL,
  highchartColorsIndonesiaLegalClassification2020,
  locationsPage,
  proLayers,
  treeCoverLossTilesUrl,
} from '../../../../common/js/config';
import { centroidSymbol, fillSymbolDefault } from '../../../../common/js/map.config';

// Style
// import 'locations/css/locations.scss';
import '../../../css/diagnostics.scss';

const mapStyle = {
  width: '100%',
  height: '100%',
};

let polyLayer;

const { treeCoverLossID } = proLayers;

export default class Diagnostics extends Component {
  constructor(props) {
    super(props);

    const { selectedLocations } = this.props;
    const isSingleLocation = selectedLocations.length === 1;

    this.mapView = undefined;

    this.state = {
      isSingleLocation,
      mapLoaded: false,
      treeCover: 0,
      primaryForest: 0,
      protectedArea: 0,
      peat: 0,
      ifl: 0,
      totalTreeCover: 0,
      totalPrimaryForest: 0,
      totalProtectedArea: 0,
      totalPeat: 0,
      totalIFL: 0,
      totalHectares: 0,
      volume: 0,
      companyID: '',
      parentCompany: '',
      suppliers: '',
      associatedRefineries: '',
      displayPopover: false,
      popoverLoading: '',
      bubbleData: {},
      hoverProp: '',
      highChartColorConfig: {
        ...locationsPage.highchartColorBackup,
        ...highchartColorsIndonesiaLegalClassification2020,
      },
      isLoading: true,
      currentView: '',
      openDownloadDialog: false,
    };
  }

  componentDidMount() {
    this.getHighchartColors();

    this.esriMap = new EsriMap({
      basemap: 'topo',
    });

    this.mapView = new MapView({
      container: this.mapContainer,
      center: [0, 16.53],
      zoom: 1,
      map: this.esriMap,
      ui: {
        components: [],
      },
    });

    this.mapView.on('click', this.viewMap);

    this.mapView.when(this.mapLoaded); // TODO: setExtent of the map again after it loads to get rid of those funny dark TCL renders!
  }

  shouldComponentUpdate(nextProps) {
    const { view } = this.props;

    return (
      (view === 'lists' && nextProps.view === 'diagnostics') ||
      (view === 'diagnostics' && nextProps.view === 'diagnostics') ||
      (view === 'diagnostics' && nextProps.view !== 'diagnostics')
    );
  }

  componentDidUpdate(prevProps) {
    const { mapLoaded } = this.state;
    const { view } = this.props;

    if (mapLoaded) {
      if (view === 'diagnostics' && prevProps.view === 'lists') {
        if (polyLayer && polyLayer.removeAll) {
          polyLayer.removeAll();
        }
        this.addMapGraphics();
      }
    }
  }

  assignHighchartColor = (legendName) => {
    const { highChartColorConfig } = this.state;
    const colorExists = highChartColorConfig[legendName];
    if (!colorExists) {
      console.log('Cound not find color for: ', legendName);
    }
    return colorExists || '#fff';
  };

  getHighchartColors = () => {
    const promises = locationsPage.highchartSlugs.map((slug) =>
      httpRequest.fetchGet(`https://production-api.globalforestwatch.org/v1/layer?slug=${slug}`)
    );
    Promise.all(promises)
      .then((responses) => {
        const { highChartColorConfig } = this.state;
        const highChartColorConfigFromAPI = {};

        const jsonConfigs = responses.map((response) => JSON.parse(response));
        jsonConfigs.forEach((config) => {
          const categories =
            config?.data[0]?.attributes?.legendConfig?.items[0]?.categories ||
            config?.data[0]?.attributes?.legendConfig?.items;
          categories?.forEach((category) => {
            const { name, color } = category;
            highChartColorConfigFromAPI[name] = color;
          });
        });
        this.setState(
          {
            highChartColorConfig: {
              ...highChartColorConfig,
              ...highChartColorConfigFromAPI,
            },
          },
          () => {
            console.log('Retrieved color configuration');
          }
        );
      })
      .catch((e) => {
        console.log('Error retrieving color configuration - using backup', e);
      });
  };

  mapLoaded = (view) => {
    this.view = view;
    window.view = view;
    this.setState(
      {
        isLoading: false,
        mapLoaded: true,
      },
      () => {
        this.addTreeCoverLoss();
        this.addMapGraphics();
        this.view.focus();
      }
    );
  };

  addMapGraphics = async () => {
    const { selectedLists, spatialData, selectedLocations } = this.props;
    const [selectedList] = selectedLists;
    const { id, list_name: listName } = selectedList;
    this.updateStats();

    const isGFWList = isGfwList(listName);
    if (selectedLocations.length > 1) {
      if (isGFWList) {
        // Show GFW Pro List Locations using Vector Tiles on the map
        await handleGfwProListVectorTileLayer(this.mapView.map, listName);
      } else {
        // Show Organization List Locations on the map
        await handleUserListLocationsVectorTileLayer(this.mapView, id, 'locations');
      }
    }

    const polys = [];
    if (selectedLocations.length > 1) {
      // List Multiple Locations selected
      spatialData.forEach((location) => {
        const { coordinates } = location.geometry;

        if (coordinates) {
          const listLocationCentroidGraphic = generateCentroidGraphic(
            coordinates[0],
            coordinates[1]
          );

          polys.push(listLocationCentroidGraphic);
        }
      });
    } else {
      // List Single Locations selected
      spatialData.forEach((result) => {
        const esriJson = geojsonUtil.geojsonToArcGIS(result.geometry);
        const poly = new Polygon({
          rings: esriJson.rings,
          spatialReference: { wkid: 4326 },
        });

        const polyGraphic = new Graphic({
          geometry: poly,
          symbol: fillSymbolDefault,
        });

        const centroidGraphic = new Graphic({
          geometry: poly,
          symbol: centroidSymbol,
        });

        polys.push(polyGraphic);
        polys.push(centroidGraphic);
      });

      let { extent } = polys[0].geometry;
      polys.forEach((poly) => {
        if (poly.geometry.extent) {
          if (poly.geometry.extent.xmin) {
            if (extent) {
              extent = extent.union(poly.geometry.extent);
            } else {
              extent = poly.geometry.extent;
            }
          }
        }
      });

      this.view.goTo(extent);
    }

    if (polyLayer) {
      this.esriMap.remove(polyLayer);
    }

    polyLayer = new GraphicsLayer({
      graphics: polys,
    });

    this.esriMap.add(polyLayer);
    this.view.focus();
  };

  addTreeCoverLoss = () => {
    esriConfig.request.corsEnabledServers.push('storage.googleapis.com');
    const tclLayer = new TreeCoverLossLayer({
      id: 'tree-cover-loss',
      visible: true,
      urlTemplate: treeCoverLossTilesUrl,
      view: this.view,
    });
    this.view.map.add(tclLayer);
  };

  viewMap = (evt) => {
    const { listData, selectedLocations, selectedLists, listView } = this.props;
    let locationIds = selectedLocations;
    const gfwList = getGfwListName(selectedLists);

    const { selectedList } = store.getState();

    if (gfwList) {
      locationIds = listData
        .filter((d) => selectedLocations.indexOf(d.location_id) > -1)
        .map((location) => getGFWListLocationIDs(gfwList, location));

      if (selectedLocations.length === listData.length) {
        locationIds = listData.map((location) => getGFWListLocationIDs(gfwList, location));
      }
    } else {
      locationIds = selectedLocations;
    }

    const sendData = {
      l: [treeCoverLossID],
      i: selectedList || selectedLists[0].id,
      name: selectedList || selectedLists[0].list_name,
      gfwListName: gfwList,
      numLocations: locationIds.length,
      filterCount: 0, // TODO: maybe don't hardcode this
      listView,
      canopyDensity: 30, // TODO: maybe don't hardcode this
      filteredLists: locationIds,
      g: gfwList ? discernGfwID(gfwList) : false,
      x: evt.mapPoint.longitude,
      y: evt.mapPoint.latitude,
      z: this.mapView.zoom,
      path: 'diagnostic',
      showFullListMap: locationIds.length > 1,
      totalNumberOfLocationsInList:
        selectedList?.list_locations_count || selectedLists[0]?.list_locations_count,
    };

    redirectToPage('/map', sendData);
    gtag('event', 'map click', {
      event_category: 'Diagnostics Click',
      event_label: 'user is re-directed to the map page via a Diagnostics Header map click',
    });
  };

  getFilteredLocations = () => {
    const { selectedLocations, filteredData, listData, listLevelAnalysis } = this.props;
    const { isSingleLocation } = this.state;
    const filteredLocationData = listData.filter(
      (listD) => filteredData.indexOf(listD.location_id) > -1
    );
    if (isSingleLocation) {
      const filteredLocations = filteredLocationData.filter((loc) => {
        return selectedLocations.indexOf(loc.location_id) > -1;
      });
      return filteredLocations;
    }
    if (selectedLocations.length > 1) {
      return listLevelAnalysis || [];
    }
    return [];
  };

  updateStats = () => {
    const treeCoverExtent = this.parseYearlyData('tree_cover_extent_total', 2001, 2016); // 0,
    const primaryForest = this.parseYearlyData('natural_habitat_primary', 2001, 2016); // 0,
    const protectedArea = this.parseYearlyData('protected_areas_area', 2001, 2016); // 0,
    const peat = this.parseYearlyData('peat_area', 2001, 2016); // 0,
    const ifl = this.parseYearlyData('natural_habitat_intact_forest', 2001, 2016); // 0,
    const totalHectares = this.parseYearlyData('total_area', 2001, 2016); // 0,
    const filteredLocations = this.getFilteredLocations();

    const volume = filteredLocations.length > 0 ? filteredLocations[0].Volume : '';
    const companyID = filteredLocations.length > 0 ? filteredLocations[0]['Company ID'] : '';
    const parentCompany =
      filteredLocations.length > 0 ? filteredLocations[0]['Parent Company'] : '';
    const suppliers = filteredLocations.length > 0 ? filteredLocations[0]['Supplier Name'] : '';
    const associatedRefineries =
      filteredLocations.length > 0 ? filteredLocations[0]['Refinery Name'] : '';

    const treeCoverPct = validatePct((treeCoverExtent / totalHectares) * 100);
    const primaryForestPct = validatePct((primaryForest / totalHectares) * 100);
    const protectedAreaPct = validatePct((protectedArea / totalHectares) * 100);
    const peatPct = validatePct((peat / totalHectares) * 100);
    const iflPct = validatePct((ifl / totalHectares) * 100);

    this.setState({
      treeCover: treeCoverPct,
      primaryForest: primaryForestPct,
      protectedArea: protectedAreaPct,
      peat: peatPct,
      ifl: iflPct,
      totalTreeCover: treeCoverExtent,
      totalPrimaryForest: primaryForest,
      totalProtectedArea: protectedArea,
      totalPeat: peat,
      totalIFL: ifl,
      totalHectares: Math.round(totalHectares),
      volume,
      companyID,
      parentCompany,
      suppliers,
      associatedRefineries,
    });
  };

  checkInfoBubbleCache = (id) => {
    const { infoBubbleCache } = this.props;
    return (
      Object.prototype.hasOwnProperty.call(infoBubbleCache, id) && infoBubbleCache[id] !== null
    );
  };

  togglePopover = (evt) => {
    evt.preventDefault();
    const target = evt.currentTarget;
    const infoBubbleId = target.id;

    const { infoBubbleCache } = this.props;

    this.setState({
      popoverLoading: infoBubbleId,
    });

    if (this.checkInfoBubbleCache(infoBubbleId)) {
      this.setState({
        displayPopover: true,
        bubbleData: infoBubbleCache[infoBubbleId],
        popoverLoading: '',
        anchorEl: target,
      });
      // early return if we have the info in cache
      return;
    }

    // if the info is not in the cache, go get it
    const promise = new Deferred();
    const request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      const resp = JSON.parse(request.response);

      store.dispatch(updateInfoBubbleCache(infoBubbleId, resp.data));

      this.setState({
        displayPopover: true,
        bubbleData: resp.data,
        popoverLoading: '',
        anchorEl: target,
      });
    });

    request.onerror = () => {
      promise.resolve(false);
    };

    request.open('POST', `${DATA_API_URL}/dataApi/getInfoBubbleData/${infoBubbleId}`);
    request.send();
    gtag('event', 'info button clicked', {
      event_category: 'Diagnostics Click',
      event_label: `user clicked on the info button for ${infoBubbleId}`,
    });
  };

  toggleTooltips = (prop) => {
    this.setState({
      hoverProp: prop,
    });
  };

  changeToLocationView = () => {
    store.dispatch(changeView('landing'));
    const { history } = this.props;
    history.push('/');
  };

  backToLists = () => {
    const { currentView } = this.state;

    store.dispatch(changeView('lists'));
    const { history } = this.props;
    history.push('/lists');
    if (currentView === 'forest_change') {
      gtag('event', 'Back to list link clicked', {
        event_category: 'Forest Change Diagnostics Click',
        event_label: 'user returned to the list view',
      });
    }
    if (currentView === 'commodity_risk') {
      gtag('event', 'Back to list link clicked', {
        event_category: 'Commodity Risk Diagnostics Click',
        event_label: 'user returned to the list view',
      });
    }
  };

  changeFolderView = (folder) => {
    const { history } = this.props;
    history.push('/folders');
    store.dispatch(selectFolder(folder));
    store.dispatch(changeView('folders'));
  };

  changeListView = (evt, listView) => {
    const { listView: listViewProps } = this.props;
    if (listView !== listViewProps) {
      store.dispatch(changeListView(listView));
      this.setState({
        currentView: listView,
      });
      gtag('event', 'diagnostic topic click', {
        event_category: 'Diagnostic Click',
        event_label: `user switched to ${listView} diagnostics from ${listViewProps}`,
      });
    }
  };

  fireReport = () => {
    const { currentView } = this.state;
    window.print(); // TODO: Update print css -header is too tall, highcharts too wide
    if (currentView === 'forest_change') {
      gtag('event', 'Report button clicked', {
        event_category: 'Forest Change Diagnostics Print',
        event_label: 'user printed forest change diagnostics report',
      });
    } else if (currentView === 'commodity_risk') {
      gtag('event', 'Report button clicked', {
        event_category: 'Commodity Risk Diagnostics Print',
        event_label: 'user printed commodity risk diagnostics report',
      });
    } else {
      gtag('event', 'Report button clicked', {
        event_category: 'Diagnostics Print',
        event_label: 'user printed diagnostics report',
      });
    }
  };

  getYearlyData = (property, startYear, endYear, allowNullValues) => {
    const obj = {};
    const filteredLocations = this.getFilteredLocations();
    const data = filteredLocations.filter((l) => l[property]).map((l) => JSON.parse(l[property]));
    data.forEach((location) => {
      Object.entries(location).forEach((pair) => {
        const [year, value] = pair;
        if (year >= startYear && year <= endYear) {
          if (Object.prototype.hasOwnProperty.call(obj, year)) {
            obj[year] += value;
          } else {
            obj[year] = value;
          }
        }
      });
    });
    // Check for missing yearly data due to data inconsistencies
    let currentYear = startYear;
    while (currentYear <= endYear) {
      if (!Object.prototype.hasOwnProperty.call(obj, currentYear)) {
        obj[currentYear] = allowNullValues ? null : 0;
      }
      currentYear += 1;
    }
    return obj;
  };

  parseYearlyData = (property, startYear, endYear) => {
    let total = 0;

    this.getFilteredLocations().forEach((loc) => {
      if (loc[property]) {
        const yearlyData = JSON.parse(loc[property]);
        if (
          property === 'tree_cover_loss_brazil_biomes_yearly' ||
          property === 'tree_cover_loss_sea_landcover_yearly' ||
          property === 'tree_cover_loss_idn_landcover_yearly' ||
          property === 'tree_cover_loss_idn_legal_yearly'
        ) {
          const biomes = Object.keys(yearlyData);
          biomes.forEach((biome) => {
            Object.entries(yearlyData[biome]).forEach((entry) => {
              const [year, value] = entry;
              if (year <= endYear && year >= startYear) {
                total += value;
              }
            });
          });
        } else if (yearlyData.forEach) {
          yearlyData.forEach((year) => {
            if (year.year <= endYear && year.year >= startYear) {
              total += year.result;
            }
          });
        } else if (typeof yearlyData === 'number') {
          total += yearlyData;
        } else {
          Object.keys(yearlyData).forEach((year) => {
            if (year <= endYear && year >= startYear) {
              total += yearlyData[year];
            }
          });
        }
        total = Math.round(total * 100) / 100;
      } else {
        total = 0;
      }
    });
    total = Math.round(total * 100) / 100;

    return total;
  };

  parseTotals = (property) => {
    let total = 0;

    this.getFilteredLocations().forEach((location) => {
      total += location[property];
    });

    return Math.round(total * 100) / 100;
  };

  fireDownload = (table, aggregate) => {
    const { selectedLists, listView } = this.props;
    const filteredLocations = this.getFilteredLocations().map((fd) => fd.location_id) ?? [];
    const [list] = selectedLists;

    this.setState({ isLoading: true, openDownloadDialog: true });

    downloadRequest({
      listID: list.id,
      format: 'csv',
      type: table,
      listView,
      aggregate,
      selectedLocations: filteredLocations,
    })
      .then(() => {
        this.setState({
          isLoading: false,
          openDownloadDialog: false,
        });
      })
      .catch((err) => {
        console.warn('err', err);
      });
  };

  setOpenDownloadDialog = (boolean) => {
    this.setState({
      openDownloadDialog: boolean,
    });
  };

  getYearlyHighchartSeries = (yearlyData) => {
    return Object.entries(yearlyData).map((year) => {
      const [key, value] = year;
      return {
        x: parseInt(key, 10),
        y: value,
        name: key.toString(),
      };
    });
  };

  getCategoricalHighchartSeries = (prop, startYear, endYear) => {
    // Series to be used in highcharts
    const series = [];
    // Get all locations in Current Forest Diagnostic
    const filteredLocations = this.getFilteredLocations();
    filteredLocations.forEach((location) => {
      // Check if location has prop
      if (Object.prototype.hasOwnProperty.call(location, prop)) {
        const jsonData = JSON.parse(location[prop]);
        const categories = Object.keys(jsonData);
        categories.forEach((category) => {
          // Check if series contains the category serie
          const checkSerie = series.find((obj) => obj.name === category);
          // If it does have the category serie
          if (checkSerie) {
            const filteredYears = [];
            Object.entries(jsonData[category]).forEach((year) => {
              const [key, value] = year;
              if (parseInt(key, 10) <= endYear && parseInt(key, 10) >= startYear) {
                filteredYears.push(value);
              }
            });
            // The appropriate values to the previous
            checkSerie.data = checkSerie.data.map((value, idx) => {
              const newValue = [...value];
              newValue[1] += filteredYears[idx];
              return newValue;
            });
            // No category exist in series
          } else {
            const serie = {};
            serie.name = category;
            serie.data = [];
            serie.stack = prop;
            serie.color = this.assignHighchartColor(category);
            serie.groupPadding = 0;
            serie.showInLegend = false;
            Object.entries(jsonData[category]).forEach((year) => {
              const [key, value] = year;
              if (parseInt(key, 10) <= endYear && parseInt(key, 10) >= startYear) {
                serie.data.push({
                  x: parseInt(key, 10),
                  y: value,
                  name: key.toString(),
                });
              }
            });
            series.push(serie);
          }
        });
      }
    });
    return series;
  };

  render() {
    const {
      view,
      listView,
      selectedLists,
      selectedLocations,
      filteredData,
      listData,
      anchorEl,
      bubbleData,
      displayPopover,
      diagnosticView,
    } = this.props;

    const {
      treeCover,
      primaryForest,
      protectedArea,
      peat,
      ifl,
      totalHectares,
      volume,
      companyID,
      parentCompany,
      suppliers,
      associatedRefineries,
      hoverProp,
      popoverLoading,
      isLoading,
      isSingleLocation,
      totalTreeCover,
      totalPrimaryForest,
      totalProtectedArea,
      totalPeat,
      totalIFL,
      openDownloadDialog,
    } = this.state;

    const filteredLocationData = listData.filter(
      (listD) => filteredData.indexOf(listD.location_id) > -1
    );

    const forestChangeDisabled = filteredLocationData.length === 0;
    const commodityRiskDisabled = !checkValidViewCommodity(selectedLists, listData);

    const filteredLocations = this.getFilteredLocations();

    const asiaPresence = filteredLocations.some(
      (location) => location.southeast_asia_presence === 'true'
    );
    const sAmericaPresence = filteredLocations.some(
      (location) => location.south_america_presence === 'true'
    );

    const listViewOptions = [];

    if (forestChangeDisabled !== true) {
      listViewOptions.push({ value: 'forest_change', label: 'Forest change' });
    }

    if (commodityRiskDisabled !== true) {
      listViewOptions.push({ value: 'commodity_risk', label: 'Commodity risk' });
    }

    return (
      <div
        className={`${
          view === 'diagnostics' ? 'landing-diagnostics' : 'hidden background__overlay'
        }`}
      >
        <Popover
          open={displayPopover}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={closePopover}
        >
          <InfoBubbleContent bubbleData={bubbleData} closeBubble={closePopover} />
        </Popover>
        <ModalLoader open={isLoading} />
        <div className="locations-diagnostics__header">
          <div className="locations-diagnostics__header-container">
            <div className="locations-diagnostics__header-data">
              <div className="header-container">
                {selectedLists.length > 0 ? (
                  <Breadcrumbs>
                    <LinkButton
                      label={locationsPage.lists.locations}
                      onClick={this.changeToLocationView}
                    />
                    {selectedLists[0].folder && (
                      <LinkButton
                        label={selectedLists[0].folder.name}
                        onClick={() => this.changeFolderView(selectedLists[0].folder)}
                      />
                    )}
                    <LinkButton label={selectedLists[0].list_name} onClick={this.backToLists} />
                    <span>{locationsPage.lists.diagnostic}</span>
                  </Breadcrumbs>
                ) : null}

                {isSingleLocation ? (
                  <SingleLocationDiagnosticsHeaderInfo
                    selectedLists={selectedLists}
                    filteredLocations={filteredLocations}
                  />
                ) : (
                  <FullListDiagnosticsHeaderInfo selectedLists={selectedLists} />
                )}
              </div>
              <div className="locations-diagnostics-statistics">
                <table className="historic-site-characteristics">
                  <thead>
                    <tr>
                      <th colSpan={3}>
                        <div className="locations-diagnostics-statistics__title historic locations-diagnostics__flex-center">
                          <span className="locations-historic-characteristics">
                            Historic Site Characteristics
                          </span>
                          <IconButtonWrapper
                            id={locationsPage.infoBubbleConfig.bannerHistoricSite}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      onMouseEnter={() => this.toggleTooltips('totalTreeCover')}
                      onMouseLeave={() => this.toggleTooltips('')}
                    >
                      <td>
                        <span
                          className={`locations-diagnostics-statistics-tooltip ${
                            hoverProp === 'totalTreeCover' ? '' : 'hidden'
                          }`}
                        >
                          {`${prettifyNum(
                            formatNum(totalTreeCover)
                          )} ha tree cover 2000 / ${prettifyNum(
                            formatNum(totalHectares)
                          )} total ha area`}
                        </span>
                        <span className="statistics-label">Tree Cover Extent</span>
                      </td>
                      <td className="statistics-value percentage">
                        {treeCover > 0 ? `${formatPct(treeCover)}%` : '--'}
                      </td>
                      <td>
                        <div className="statistics-bar__container">
                          <div
                            className="statistics-bar__data"
                            style={treeCover > 0 ? { width: `${treeCover}%` } : { width: '0%' }}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr
                      onMouseEnter={() => this.toggleTooltips('totalPrimaryForest')}
                      onMouseLeave={() => this.toggleTooltips('')}
                    >
                      <td>
                        <span
                          className={`locations-diagnostics-statistics-tooltip ${
                            hoverProp === 'totalPrimaryForest' ? '' : 'hidden'
                          }`}
                        >
                          {`${prettifyNum(
                            formatNum(totalPrimaryForest)
                          )} ha primary forest 2000 / ${prettifyNum(
                            formatNum(totalHectares)
                          )} total ha area`}
                        </span>
                        <span className="statistics-label">Primary Forest</span>
                      </td>
                      <td className="statistics-value">
                        {primaryForest > 0 ? `${formatPct(primaryForest)}%` : '--'}
                      </td>
                      <td>
                        <div className="statistics-bar__container">
                          <div
                            className="statistics-bar__data"
                            style={
                              primaryForest > 0 ? { width: `${primaryForest}%` } : { width: '0%' }
                            }
                          />
                        </div>
                      </td>
                    </tr>
                    <tr
                      onMouseEnter={() => this.toggleTooltips('totalProtectedArea')}
                      onMouseLeave={() => this.toggleTooltips('')}
                    >
                      <td>
                        <span
                          className={`locations-diagnostics-statistics-tooltip ${
                            hoverProp === 'totalProtectedArea' ? '' : 'hidden'
                          }`}
                        >
                          {`${prettifyNum(
                            formatNum(totalProtectedArea)
                          )} ha protected areas (varies) / ${prettifyNum(
                            formatNum(totalHectares)
                          )} total ha area`}
                        </span>
                        <span className="statistics-label">Protected Area</span>
                      </td>
                      <td className="statistics-value">
                        {protectedArea > 0 ? `${formatPct(protectedArea)}%` : '--'}
                      </td>
                      <td>
                        <div className="statistics-bar__container">
                          <div
                            className="statistics-bar__data"
                            style={
                              protectedArea > 0 ? { width: `${protectedArea}%` } : { width: '0%' }
                            }
                          />
                        </div>
                      </td>
                    </tr>
                    <tr
                      onMouseEnter={() => this.toggleTooltips('totalPeat')}
                      onMouseLeave={() => this.toggleTooltips('')}
                    >
                      <td>
                        <span
                          className={`locations-diagnostics-statistics-tooltip ${
                            hoverProp === 'totalPeat' ? '' : 'hidden'
                          }`}
                        >
                          {`${prettifyNum(formatNum(totalPeat))} ha peat 2012 / ${prettifyNum(
                            formatNum(totalHectares)
                          )} total ha area`}
                        </span>
                        <span className="statistics-label">Peat</span>
                      </td>
                      <td className="statistics-value">
                        {peat > 0 ? `${formatPct(peat)}%` : '--'}
                      </td>
                      <td>
                        <div className="statistics-bar__container">
                          <div
                            className="statistics-bar__data"
                            style={peat > 0 ? { width: `${peat}%` } : { width: '0%' }}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr
                      onMouseEnter={() => this.toggleTooltips('totalIFL')}
                      onMouseLeave={() => this.toggleTooltips('')}
                    >
                      <td>
                        <span
                          className={`locations-diagnostics-statistics-tooltip ${
                            hoverProp === 'totalIFL' ? '' : 'hidden'
                          }`}
                        >
                          {`${prettifyNum(
                            formatNum(totalIFL)
                          )} ha intact forest lands 2013 / ${prettifyNum(
                            formatNum(totalHectares)
                          )} total ha area`}
                        </span>
                        <span className="statistics-label">Intact Forest Landscape</span>
                      </td>
                      <td className="statistics-value">{ifl > 0 ? `${formatPct(ifl)}%` : '--'}</td>
                      <td>
                        <div className="statistics-bar__container">
                          <div
                            className="statistics-bar__data"
                            style={ifl > 0 ? { width: `${ifl}%` } : { width: '0%' }}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr />
                  </tbody>
                </table>

                <table className="list-attributes">
                  <thead>
                    <tr>
                      <th colSpan={2}>
                        <div className="locations-diagnostics__flex-center historic">
                          <span className="locations-diagnostics-statistics__title locations-historic-characteristics">
                            List Attributes
                          </span>
                          <IconButtonWrapper
                            id={locationsPage.infoBubbleConfig.bannerListAttributes}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="statistics-label">Total Hectares</td>
                      <td className="statistics-value">{prettifyNum(formatNum(totalHectares))}</td>
                    </tr>
                    {isSingleLocation ? (
                      <>
                        <tr>
                          <td className="statistics-label">Volume in tonnes</td>
                          <td className="statistics-value">{volume}</td>
                        </tr>
                        <tr>
                          <td className="statistics-label">Company ID</td>
                          <td className="statistics-value">{companyID}</td>
                        </tr>
                        <tr>
                          <td className="statistics-label">Parent Company</td>
                          <td
                            className="statistics-value"
                            data-cell-type="parent-company"
                            title={
                              parentCompany && parentCompany.length > 15 ? parentCompany : null
                            }
                          >
                            {parentCompany}
                          </td>
                        </tr>
                        <tr>
                          <td className="statistics-label">Suppliers</td>
                          <td
                            className="statistics-value"
                            data-cell-type="suppliers"
                            title={suppliers && suppliers.length > 15 ? suppliers : null}
                          >
                            {suppliers}
                          </td>
                        </tr>
                        <tr>
                          <td className="statistics-label">Associated Refineries</td>
                          <td className="statistics-value">{associatedRefineries}</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr />
                        <tr />
                        <tr />
                        <tr />
                        <tr />
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div id="locations-diagnostics-header-map" className="locations-diagnostics-header-map">
              <div
                className="locations-diagnostics-map-overlay"
                data-locations-diagnostics-map-overlay-visible={isLoading}
              />
              <div
                style={mapStyle}
                ref={(div) => {
                  this.mapContainer = div;
                }}
              />
            </div>
          </div>
        </div>
        <div className="locations-diagnostics__action-bar-container">
          <div className="locations-diagnostics__action-bar">
            <div className="locations-diagnostics__actions-group">
              <label htmlFor="viewToggle">Diagnostic</label>
              <GfwSelect
                id="viewToggle"
                name="viewToggleName"
                onChange={(evt) => this.changeListView(evt, evt.value)}
                value={{ value: listView }}
                options={listViewOptions}
              />
            </div>
            <div className="locations-diagnostics__actions-group">
              <Button
                variant="secondary"
                label="Report"
                onClick={this.fireReport}
                icon={<IconReport height="18" />}
              />
              <Button
                variant="secondary"
                label="Download"
                onClick={() => this.fireDownload('everything')}
                icon={<IconDownload height="18" />}
              />
            </div>
          </div>
        </div>

        <div className="locations-diagnostics__body">
          <div className="print-no-break">
            <SensitiveAreas
              primaryForest={primaryForest}
              protectedArea={protectedArea}
              peat={peat}
              ifl={ifl}
              listView={listView}
              view={view}
              fireDownload={this.fireDownload}
              filteredData={filteredLocationData}
              getYearlyData={this.getYearlyData}
              parseYearlyData={this.parseYearlyData}
              getFilteredLocations={this.getFilteredLocations}
              parseTotals={this.parseTotals}
              getYearlyHighchartSeries={this.getYearlyHighchartSeries}
              getCategoricalHighchartSeries={this.getCategoricalHighchartSeries}
            />
          </div>
          <div className="print-no-break">
            <h2
              className={`locations-diagnostics__subtitle ${
                listView === 'forest_change' && (sAmericaPresence || asiaPresence)
                  ? 'locations-diagnostics__flex-center'
                  : 'hidden'
              }`}
            >
              Regions
            </h2>

            {sAmericaPresence ? (
              <SouthAmericaRegions
                diagnosticView={diagnosticView}
                listView={listView}
                view={view}
                fireDownload={this.fireDownload}
                filteredData={filteredLocationData}
                togglePopover={this.togglePopover}
                popoverLoading={popoverLoading}
                getYearlyData={this.getYearlyData}
                parseYearlyData={this.parseYearlyData}
                assignHighchartColor={this.assignHighchartColor}
                getFilteredLocations={this.getFilteredLocations}
                getYearlyHighchartSeries={this.getYearlyHighchartSeries}
                getCategoricalHighchartSeries={this.getCategoricalHighchartSeries}
              />
            ) : null}

            {asiaPresence ? (
              <SoutheastAsiaRegions
                diagnosticView={diagnosticView}
                listView={listView}
                view={view}
                fireDownload={this.fireDownload}
                filteredData={filteredLocationData}
                togglePopover={this.togglePopover}
                popoverLoading={popoverLoading}
                getYearlyData={this.getYearlyData}
                parseYearlyData={this.parseYearlyData}
                totalHectares={totalHectares}
                assignHighchartColor={this.assignHighchartColor}
                getFilteredLocations={this.getFilteredLocations}
                getYearlyHighchartSeries={this.getYearlyHighchartSeries}
                getCategoricalHighchartSeries={this.getCategoricalHighchartSeries}
              />
            ) : null}
          </div>
          <div className="print-no-break">
            {listView === 'commodity_risk' && view === 'diagnostics' ? (
              <MillPrioritySummary
                listView={listView}
                view={view}
                fireDownload={this.fireDownload}
                filteredData={filteredLocationData}
                togglePopover={this.togglePopover}
                popoverLoading={popoverLoading}
                getYearlyData={this.getYearlyData}
                selectedLocations={selectedLocations}
                getFilteredLocations={this.getFilteredLocations}
                parseYearlyData={this.parseYearlyData}
              />
            ) : null}
          </div>
          <div className="print-no-break">
            {listView === 'commodity_risk' && view === 'diagnostics' ? (
              <PalmRiskAnalysis
                listView={listView}
                view={view}
                fireDownload={this.fireDownload}
                filteredData={filteredLocationData}
                togglePopover={this.togglePopover}
                popoverLoading={popoverLoading}
                getYearlyData={this.getYearlyData}
                selectedLocations={selectedLocations}
                getFilteredLocations={this.getFilteredLocations}
                parseYearlyData={this.parseYearlyData}
              />
            ) : null}
          </div>
          <div className="print-no-break">
            {listView === 'commodity_risk' && view === 'diagnostics' ? (
              <DeforestationTrends
                listView={listView}
                view={view}
                fireDownload={this.fireDownload}
                filteredData={filteredLocationData}
                togglePopover={this.togglePopover}
                popoverLoading={popoverLoading}
                getYearlyData={this.getYearlyData}
                selectedLocations={selectedLocations}
                parseYearlyData={this.parseYearlyData}
                totalHectares={totalHectares}
                assignHighchartColor={this.assignHighchartColor}
                getFilteredLocations={this.getFilteredLocations}
                getYearlyHighchartSeries={this.getYearlyHighchartSeries}
                getCategoricalHighchartSeries={this.getCategoricalHighchartSeries}
              />
            ) : null}
          </div>

          <div className="print-no-break">
            {listView === 'commodity_risk' && view === 'diagnostics' ? (
              <PalmRiskList
                listView={listView}
                view={view}
                fireDownload={this.fireDownload}
                filteredData={filteredLocationData}
                togglePopover={this.togglePopover}
                popoverLoading={popoverLoading}
                selectedLocations={selectedLocations}
              />
            ) : null}
          </div>
        </div>
        <ConfirmDialog open={openDownloadDialog} setDialogOpen={this.setOpenDownloadDialog} />
      </div>
    );
  }
}
