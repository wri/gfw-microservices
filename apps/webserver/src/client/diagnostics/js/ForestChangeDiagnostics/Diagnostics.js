import React, { Component } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';

import TreeCoverLossLayer from '../../../map/js/layers/TreeCoverLossLayer';
import store from '../../../locations/js/store';
import { updateInfoBubbleCache } from '../../../locations/js/actions/locationActions';
import SensitiveAreas from './SensitiveAreas';
import SoutheastAsiaRegions from './SoutheastAsiaRegions';
import DeforestationTrends from './DeforestationTrends';
import MillPrioritySummary from './MillPrioritySummary';
import PalmRiskAnalysis from './PalmRiskAnalysis';
import PalmRiskList from './PalmRiskList';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';
import SingleLocationDiagnosticsHeaderInfo from './DiagnosticsHeaderInfo/SingleLocationDiagnosticsHeaderInfo';
import FullListDiagnosticsHeaderInfo from './DiagnosticsHeaderInfo/FullListDiagnosticsHeaderInfo';
import ConfirmDialog from '../../../locations/js/components/lists/download/confirmDialog';
import downloadRequest from '../../../locations/js/components/lists/download/downloadRequest';
import DiagnosticsBreadCrums from '../common/DiagnosticsBreadCrums';
import DiagnosticsMenuBar from '../common/DiagnosticsMenuBar';
import RegionChartsContainer from './SouthAmericaRegions/RegionChartsContainer';
import InfoBubble from '../../../common/js/components/InfoBubble';

// Utils
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import httpRequest from '../../../common/js/utils/httpRequest';
import redirectToPage from '../../../common/js/utils/redirect';
import {
  formatNum,
  formatPct,
  prettifyNum,
  validatePct,
} from '../../../common/js/utils/diagnostics.utils';
import { handleUserListLocationsVectorTileLayer } from '../../../common/js/userListLocations/utils/userListLocations.util';
import { generateCentroidGraphic } from '../../../common/js/utils/esri.utils';
import getAvailableDiagnostics from './getAvailableDiagnostics';
import { handleGfwProListVectorTileLayer } from '../../../common/js/utils/gfw.utils';

// Configs
import {
  DATA_API_URL,
  highchartColorsIndonesiaLegalClassification2020,
  locationsPage,
  proLayers,
  treeCoverLossTilesUrl,
} from '../../../common/js/config';
import { centroidSymbol, fillSymbolDefault } from '../../../common/js/map.config';
import AnalysisListChips from '../../../locations/js/components/landing/listItem/AnalysisListChips';
import { analysisTypes } from '../../../../config/env/analysisTypes.constants';

import '../../css/locations.scss';
import '../common/DiagnosticsContainer.scss';

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
      listView: 'forest_change',
      openDownloadDialog: false,
      anchorEl: null,
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
    const { selectedList, spatialData, selectedLocations, isGfwList } = this.props;
    const { id, list_name: listName } = selectedList;

    this.updateStats();

    if (selectedLocations.length > 1) {
      if (isGfwList) {
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
          spatialReference: SpatialReference.WGS84,
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
    const tclLayer = new TreeCoverLossLayer({
      id: 'tree-cover-loss',
      visible: true,
      urlTemplate: treeCoverLossTilesUrl,
      view: this.view,
    });
    this.view.map.add(tclLayer);
  };

  viewMap = (evt) => {
    const { selectedLocations, selectedList, isGfwList } = this.props;
    const { listView } = this.state;
    const {
      id: listId,
      list_name: listName,
      list_locations_count: totalNumberOfLocationsInList,
    } = selectedList;
    const showFullListMap = selectedLocations.length !== 1; // if there is no specific location selected, then show the full map

    const sendData = {
      l: [treeCoverLossID],
      i: listId,
      name: listName,
      gfwListName: listName,
      numLocations: showFullListMap ? totalNumberOfLocationsInList : 1,
      filterCount: 0, // TODO: maybe don't hardcode this
      listView,
      canopyDensity: 30, // TODO: maybe don't hardcode this
      filteredLists: showFullListMap ? [] : selectedLocations,
      g: isGfwList,
      x: evt.mapPoint.longitude,
      y: evt.mapPoint.latitude,
      z: this.mapView.zoom,
      path: 'diagnostic',
      showFullListMap,
      totalNumberOfLocationsInList,
    };

    redirectToPage('/map', sendData);
    gtag('event', 'map click', {
      event_category: 'Diagnostics Click',
      event_label: 'user is re-directed to the map page via a Diagnostics Header map click',
    });
  };

  getFilteredLocations = () => {
    const { selectedLocations, listData, listLevelAnalysis } = this.props;
    const { isSingleLocation } = this.state;

    if (isSingleLocation) {
      const filteredLocations = listData.filter((loc) =>
        selectedLocations.includes(loc.location_id)
      );
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
      Promise.resolve(false);
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
    window.location = '/locations';
  };

  changeListView = (evt, listView) => {
    const { listView: currentView } = this.state;
    this.setState({
      listView,
    });
    gtag('event', 'diagnostic topic click', {
      event_category: 'Diagnostic Click',
      event_label: `user switched to ${listView} diagnostics from ${currentView}`,
    });
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
    const { selectedList, isGfwList } = this.props;
    const { listView } = this.state;
    const filteredLocations = this.getFilteredLocations().map((fd) => fd.location_id) ?? [];

    const { id: listId } = selectedList;

    this.setState({ isLoading: true, openDownloadDialog: true });

    downloadRequest({
      listID: listId,
      format: 'csv',
      type: table,
      listView,
      aggregate,
      selectedLocations: filteredLocations,
      isGfwList,
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
      selectedList,
      selectedLocations,
      listData,
      selectedLocationData,
      popoverLoading,
      diagnosticView,
      isSharedList,
      isGfwList,
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
      isLoading,
      isSingleLocation,
      totalTreeCover,
      totalPrimaryForest,
      totalProtectedArea,
      totalPeat,
      totalIFL,
      openDownloadDialog,
      listView,
    } = this.state;

    const filteredLocations = this.getFilteredLocations();
    const asiaPresence = filteredLocations.some(
      (location) => location.southeast_asia_presence === 'true'
    );
    const isAmericaPresence = filteredLocations.some(
      (location) => location.south_america_presence === 'true'
    );
    // TODO: refactor all callsites of getAvailableDiagnostics to use selectedList instead of the first element of its plural
    const availableDiagnostics = getAvailableDiagnostics(listData, [selectedList]);

    const showListViewTabs = availableDiagnostics.length > 1;
    const listViewOptions = availableDiagnostics.map(({ label, value }) => (
      <Tab key={value} label={<span style={{ color: 'white' }}>{label}</span>} value={value} />
    ));

    return (
      <div className="landing-diagnostics">
        <ModalLoader open={isLoading} />
        <div className="locations-diagnostics__header">
          <div className="locations-diagnostics__header-container">
            <div className="locations-diagnostics__header-data">
              <div className="header-container">
                <DiagnosticsBreadCrums
                  selectedList={selectedList}
                  diagnosticName={locationsPage.lists.diagnostic}
                  isSharedList={isSharedList}
                  isGfwList={isGfwList}
                />

                <div style={{ marginBottom: '2rem' }}>
                  <AnalysisListChips listAnalysesStatus={selectedList?.listAnalysesStatus} />
                </div>

                {showListViewTabs && (
                  <Tabs
                    value={listView}
                    onChange={this.changeListView}
                    style={{ marginBottom: '1.7rem' }}
                    TabIndicatorProps={{ style: { background: '#97bd3d' } }}
                  >
                    {listViewOptions}
                  </Tabs>
                )}

                {isSingleLocation ? (
                  <SingleLocationDiagnosticsHeaderInfo
                    selectedListName={selectedList.list_name}
                    currentLocation={selectedLocationData}
                  />
                ) : (
                  <FullListDiagnosticsHeaderInfo selectedList={selectedList} />
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
                          <InfoBubble
                            infoBubbleId={locationsPage.infoBubbleConfig.bannerHistoricSite}
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
                          <InfoBubble
                            infoBubbleId={locationsPage.infoBubbleConfig.bannerListAttributes}
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

        <DiagnosticsMenuBar
          listId={selectedList.id}
          isGfwList={this.props.isGfwList}
          selectedDiagnostics={analysisTypes.FOREST_CHANGE_DIAGNOSTICS}
          downloadDiagnostics={() => this.fireDownload('everything')}
        />
        <div className="diagnostics-container">
          <div className="print-no-break">
            <SensitiveAreas
              primaryForest={primaryForest}
              protectedArea={protectedArea}
              peat={peat}
              ifl={ifl}
              listView={listView}
              fireDownload={this.fireDownload}
              getYearlyData={this.getYearlyData}
              parseYearlyData={this.parseYearlyData}
              getFilteredLocations={this.getFilteredLocations}
              parseTotals={this.parseTotals}
              getYearlyHighchartSeries={this.getYearlyHighchartSeries}
              getCategoricalHighchartSeries={this.getCategoricalHighchartSeries}
            />
          </div>
          <div className="print-no-break" data-cy="diagnotcs-regions">
            {isAmericaPresence && listView === 'forest_change' && (
              <RegionChartsContainer
                listId={selectedList.id}
                fireDownload={this.fireDownload}
                data={this.getFilteredLocations()[0]}
                diagnosticView={diagnosticView}
                filteredData={listData}
                togglePopover={this.togglePopover}
                getYearlyData={this.getYearlyData}
                parseYearlyData={this.parseYearlyData}
                assignHighchartColor={this.assignHighchartColor}
                getFilteredLocations={this.getFilteredLocations}
                getYearlyHighchartSeries={this.getYearlyHighchartSeries}
                getCategoricalHighchartSeries={this.getCategoricalHighchartSeries}
              />
            )}

            {asiaPresence ? (
              <SoutheastAsiaRegions
                diagnosticView={diagnosticView}
                listView={listView}
                fireDownload={this.fireDownload}
                filteredData={listData}
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
            {listView === 'commodity_risk' ? (
              <MillPrioritySummary
                listView={listView}
                fireDownload={this.fireDownload}
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
            {listView === 'commodity_risk' ? (
              <PalmRiskAnalysis
                listView={listView}
                fireDownload={this.fireDownload}
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
            {listView === 'commodity_risk' ? (
              <DeforestationTrends
                listView={listView}
                fireDownload={this.fireDownload}
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
            {listView === 'commodity_risk' ? (
              <PalmRiskList
                listView={listView}
                fireDownload={this.fireDownload}
                filteredData={listData}
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
