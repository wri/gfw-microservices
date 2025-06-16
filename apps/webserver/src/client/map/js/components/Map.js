import { Component } from 'react';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
// ESRI Imports
import EsriMap from '@arcgis/core/Map';
import Extent from '@arcgis/core/geometry/Extent';
import * as GeometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import Point from '@arcgis/core/geometry/Point';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import CustomDialog from '../../../common/js/components/CustomDialog/CustomDialog';

import { addCoordinateTextFromPoint } from '../../../locations/js/components/adding/PolygonCoordinates/polygonCoordinates.utils';
import featureFlags from '../../../../utils/general.utils';

import store from '../store';
import {
  addList,
  showMapLoader,
  populateLayers,
  removeList,
  resetList,
  saveSketchTool,
  setFireDays,
  showLayerInfo,
  showLoading,
  toggleDrawing,
  toggleDrawShapeNoteDetailsModal,
  toggleLayer,
  turnLayerOff,
  toggleHighConfidenceAlertsForDeforestationAlertsLayers,
  updateAnalysis,
  updateGFWLocations,
  updateCanopyDensity,
  updateTreeCoverLossCanopyDensity,
  toggleCanopyModal,
  toggleTreeCoverLossCanopyModal,
} from '../actions/mapActions';
import * as analysisActions from '../actions/analysisActions';

import { DATA_API_URL, mapPage, supportedGeostoreAnalysis } from '../../../common/js/config';
import {
  proLayers,
  vectorEnabledLayers,
  noLocationLayers,
  exclusiveDrawLayers,
  exclusiveLayers,
  visibleLayers as visibleLayersConstants,
  gfwListsZoomTargets,
} from '../../../common/js/proLayers.config';
import { mapLayersMenu } from '../../../common/js/mapLayersMenu.config';

import {
  centroidHighlightSymb,
  centroidSymbol,
  fillSymbolDefault,
  fillSymbolHighlight,
} from '../../../common/js/map.config';
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import { registerGeometry } from '../../../common/js/utils/gfwAPI';
import Page from '../../../common/js/components/Page';
import ListSection from '../../../common/js/components/listPanel/ListSection';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';

// Utils
import utils from '../utils/AppUtils';
import layerInfoCache from '../utils/layerInfoCache';
import { layerFactory } from '../utils/LayerFactory';
import { identifyPoints } from '../utils/LayerUtils';
import { getBBoxAndGeostoreIDs, getVectorTileStyle } from '../utils/gfw-api.utils';
import setVectorTileLayerForFilteredList from '../utils/setVectorTileLayerForFilteredList';
import setVectorTileLayerForFullList from '../utils/setVectorTileLayerForFullList';
import { getLocationGeometry, getBasemapConfiguration } from '../utils/map.utils';
import { constructLayerObject } from '../../../common/js/utils/layer.utils';
import { getMapLayerIdFromGFWListName } from '../../../common/js/utils/gfw.utils';
import { updateInteractiveLayers } from '../utils/layerUpdates.utils';
import sortMapArray from './sortMapArray';
import { getQueryParams } from './getQueryParams';
import AnalysisPanel from './analysisPanel/AnalysisPanel';
import ControlPanel from './controls/ControlPanel';
import Warning from './controls/Warning';
import AdhocAnalysis from './controls/AdhocAnalysis';
import Legend from './legend/Legend';
import BiomassControls from './layerPanel/BiomassControls';
import FiresControls from './layerPanel/FiresControls';
import LayerPanel from './layerPanel/LayerPanel';
import LossControls from './layerPanel/LossControls';
import ProdesControls from './layerPanel/ProdesControls';
import DrawShapeNoteDetailsModal from './modals/DrawShapeNoteDetailsModal';
import BasemapModal from './modals/BasemapModal';
import { CanopyModal } from './modals/CanopyModal';
import InfoModal from './modals/InfoModal';
import LayerModal from './modals/LayerModal';
import SearchModal from './modals/SearchModal';
import { selectList } from '../../../locations/js/actions/locationActions';
import { FailedPopupDialog } from '../../../locations/js/components/landing/FailedPopupDialog';
import {
  deforestationAlertsIds,
  deforestationAlertsLayerToCoverageMap,
} from './legend/DeforestationAlerts/deforestationAlerts.constants';

import viirsLayer, { fetchViirsFeatures } from '../layers/VIIRSLayerUtil';
import { getProdesUpdatedVectorTileStyle } from '../layers/Prodes_LayerUtil';

// Configs
import {
  DEFAULT_MAPVIEW_CENTER,
  PLANET_BASEMAP,
  PLANET_BASEMAP_REFERENCE_LAYER,
  PLANET_BASEMAP_REFERENCE_LAYER_VECTOR_TILE_STYLE,
  USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID,
  MAP_WATER_COLOR,
} from '../config/map.config';

// Services
import { fetchGfwProLayers } from '../../../common/js/service/gfw.service';

// Style
import '../../css/map.scss';

// import all layer names that we will be using directly
const {
  adminAreas,
  brazilBiomesID,
  gladAlertsID,
  oilPalmConcessions,
  prodesDeforestationID,
  protectedAreas,
  rspoConcessions,
  rspoPalmOilMills,
  treeBiomassLossID,
  treeCoverLossID,
  treePlantationsSpecies,
  universalMillList,
  userLocations,
  viirsActiveFiresID,
  soyPlantedArea,
  argentineanNativeForestsLoss,
  integratedDeforestationAlertsID,
} = proLayers;

let layersToAdd;
const drawnGraphic = [];

const pageOptions = {
  links: {
    logout: true,
  },
};
const containerStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
};
const mapStyle = {
  width: '100%',
  height: '100%',
};

let currentAnalysisCall;

const { isGadm41Available } = featureFlags;

class Map extends Component {
  constructor(props) {
    super(props);

    this.mapView;

    this.goToOriginalPoint;

    // Track Active and Custom GFW Layer
    this.activeGFWLayer;
    this.customGfwVectorTileLayer;
    this._setCustomGfwVectorTileLayer;
    this._removeCustomGfwVectorTileLayer;

    // Default Popup Actions
    this.defaultPopupActions;

    const { treeCoverLossYearsFC, biomassLossYears, prodesLossYears } = mapPage;
    this.state = Object.assign(store.getState(), {
      userInfo: props.userInfo,
      dialogOpen: false,
      dialogTitle: '',
      dialogMessage: '',
      esriJson: {},
      activeGFWList: '',
      locationName: '',
      globalIds: [],
      spinnerOn: false,
      listNotAccessible: false,
      listVectorTileIsAvailable: false,
      popupSelectedFeature: null,
      treeCoverLossDateRange: {
        startYear: treeCoverLossYearsFC[0],
        endYear: treeCoverLossYearsFC[treeCoverLossYearsFC.length - 1],
      },
      biomassLossDateRange: {
        startYear: biomassLossYears[0],
        endYear: biomassLossYears[biomassLossYears.length - 1],
      },
      prodesDateRange: {
        startYear: prodesLossYears[0],
        endYear: prodesLossYears[prodesLossYears.length - 1],
      },
      prodesInitialVectorTileStyle: null,
      listSelectDropDownOpen: false,
      selectedListFromDropdown: false,
      // the above property is so the 'selected list' banner displays correctly. Once we have selected a list
      // from the dropdown, we need a way to tell the ListSelection component that we no longer care about
      // the 'listData' prop
      transitionListData: {},
      sketchEventListener: null,

      drawnCoordinates: [],
      isMapCentered: true,
    });
    this.eventHandlers = [];
    this.sketchViewModel = null;
  }

  componentWillUnmount() {
    if (this.mapView) {
      this.eventHandlers.forEach((handler) => handler.remove());
      this.eventHandlers = [];
    }
    if (this.state && this.state.sketchEventListener) {
      this.state.sketchEventListener.remove();
    }
    this.unsubscribe();
  }

  storeDidUpdate = () => {
    this.setState(store.getState());
  };

  componentDidMount() {
    this.unsubscribe = store.subscribe(this.storeDidUpdate);

    const queryParams = getQueryParams(this.props.location.search);

    const { latitude, longitude, zoom } = queryParams;

    let esriMap;
    if (isGadm41Available) {
      esriMap = new EsriMap({
        basemap: getBasemapConfiguration(),
      });
    } else {
      esriMap = new EsriMap();
      esriMap.add(
        new VectorTileLayer(mapPage.basemaps[0].customVectorUrl, {
          id: mapPage.basemaps[0].id,
        })
      );
    }

    const mapviewCenter = latitude && longitude ? [longitude, latitude] : DEFAULT_MAPVIEW_CENTER;

    const mapView = new MapView({
      container: this.refs.mapView,
      center: mapviewCenter,
      zoom: zoom ? zoom - 1 : 3,
      ...(isGadm41Available && {
        background: {
          color: MAP_WATER_COLOR,
        },
      }),
      map: esriMap,
      ui: {
        components: ['attribution'],
      },
      constraints: {
        minZoom: 2,
      },
    });
    this.mapView = mapView;

    this.eventHandlers.push(this.mapView.on('drag', this.startInteraction));
    this.eventHandlers.push(this.mapView.on('mouse-wheel', this.startInteraction));
    this.eventHandlers.push(this.mapView.on('keyboard', this.startInteraction));
    this.eventHandlers.push(this.mapView.watch('stationary', this.stopInteraction));

    mapView.when(this.mapLoaded);
  }

  startInteraction = () => {
    if (!this.state.isMapMoving) {
      this.setState({ isMapMoving: true, isMapCentered: false });
    }
  };

  stopInteraction = (stationary) => {
    if (stationary) {
      this.setState({ isMapMoving: false });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const {
      visibleLayers,
      canopyDensity,
      showHighConfidenceAlertsOnDeforestationAlertsLayer,
      modalLayerInfo,
      activeAnalysis,
      gfwListDef,
      landsatYear,
      soyYear,
      planetTileLayer,
      planetTileColor,
    } = this.state;

    updateInteractiveLayers(this.view.map, prevState, this.state);

    if (prevState.visibleLayers.length < visibleLayers.length) {
      this.view.popup.close();
      const nowVisible = visibleLayers.filter(
        (layer) => prevState.visibleLayers.indexOf(layer) === -1
      );
      nowVisible.forEach((nowVisibleLayer) => {
        let mapLayer = this.view.map.findLayerById(nowVisibleLayer);
        if (mapLayer) {
          mapLayer.visible = true;
          if (mapLayer.sublayers) {
            mapLayer.sublayers.forEach((sublayer) => {
              sublayer.visible = true;
            });
          }
        } else {
          mapLayer = layersToAdd.find((layer) => layer.id === nowVisibleLayer);
          if (mapLayer) {
            this.view.map.add(mapLayer);
            mapLayer.visible = true;
            sortMapArray(mapLayer, this.view.map);
          }
        }

        if (exclusiveLayers.includes(nowVisibleLayer)) {
          this.view.popup.actions.forEach((action) => {
            if (action.id === 'ANALYZE') {
              action.visible = true;
            } else if (action.id === 'zoom-to') {
              action.visible = false;
            }
          });
        }
        gtag('event', 'layer toggle', {
          event_category: 'Map Click',
          event_label: `user turned the ${nowVisibleLayer} layer on`,
        });
      });
    } else if (prevState.visibleLayers.length > visibleLayers.length) {
      this.view.popup.close();
      const nowHidden = prevState.visibleLayers.filter(
        (layer) => visibleLayers.indexOf(layer) === -1
      );
      nowHidden.forEach((nowHiddenLayer) => {
        const mapLayer = this.view.map.findLayerById(nowHiddenLayer);

        if (mapLayer) {
          mapLayer.visible = false;
          if (mapLayer.sublayers) {
            mapLayer.sublayers.forEach((sublayer) => {
              sublayer.visible = false;
            });
          }
        }

        if (exclusiveLayers.includes(nowHiddenLayer)) {
          this.view.popup.actions.forEach((action) => {
            if (action.id === 'ANALYZE') {
              action.visible = false;
            }
          });
        }
        gtag('event', 'layer toggle', {
          event_category: 'Map Click',
          event_label: `user turned the ${nowHiddenLayer} layer off`,
        });
      });

      const nowVisible = visibleLayers.filter(
        (layer) => prevState.visibleLayers.indexOf(layer) === -1
      );
      nowVisible.forEach((nowVisibleLayer) => {
        let mapLayer = this.view.map.findLayerById(nowVisibleLayer);
        if (!mapLayer) {
          mapLayer = layersToAdd.find((layer) => layer.id === nowVisibleLayer);
          if (mapLayer) {
            this.view.map.add(mapLayer);
            mapLayer.visible = true;
            sortMapArray(mapLayer, this.view.map);
          }
        } else {
          //If layer to be turned on is already on the map, just turn it on
          mapLayer.visible = true;
        }
      });
    } else {
      // This is only for toggling between forest change layers
      if (visibleLayers.length > 0) {
        visibleLayers.forEach((visibleLayer) => {
          const [mapLayerConfig] = mapLayersMenu.filter((mapLayer) => mapLayer.id === visibleLayer);
          const nowVisibleId = visibleLayers.filter(
            (layer) => prevState.visibleLayers.indexOf(layer) === -1
          );
          if (nowVisibleId.length > 0 && mapLayerConfig.group === 'forest-change') {
            let nowVisibleLayer = this.view.map.findLayerById(visibleLayer);
            if (nowVisibleLayer) {
              nowVisibleLayer.visible = true;
              gtag('event', 'layer toggle', {
                event_category: 'Map Click',
                event_label: `user turned the ${nowVisibleLayer.id} layer on`,
              });
            } else {
              nowVisibleLayer = layersToAdd.find((layer) => layer.id === visibleLayer);
              if (nowVisibleLayer) {
                this.view.map.add(nowVisibleLayer);
                nowVisibleLayer.visible = true;
                gtag('event', 'layer toggle', {
                  event_category: 'Map Click',
                  event_label: `user turned the ${nowVisibleLayer.id} layer on`,
                });
              }
            }
            this.updateActiveAnalysis();
          }

          const nowHiddenIds = prevState.visibleLayers.filter(
            (layer) => visibleLayers.indexOf(layer) === -1
          );
          if (nowHiddenIds.length > 0) {
            nowHiddenIds.forEach((nowHiddenId) => {
              const nowHiddenLayer = this.view.map.findLayerById(nowHiddenId);
              if (nowHiddenLayer) {
                nowHiddenLayer.visible = false;

                //Check if automatically hidden layer was a deforestation alert layer and if so, hide coverage layer too
                if (deforestationAlertsIds.includes(nowHiddenId)) {
                  const geographicCoverageLayerId =
                    deforestationAlertsLayerToCoverageMap[nowHiddenId];
                  const visibleGeographicCoverageLayer =
                    this.view.map.findLayerById(geographicCoverageLayerId);
                  if (visibleGeographicCoverageLayer) {
                    store.dispatch(turnLayerOff(geographicCoverageLayerId));
                  }
                  const { showHighConfidenceAlertsOnDeforestationAlertsLayer } = store.getState();
                  if (showHighConfidenceAlertsOnDeforestationAlertsLayer) {
                    store.dispatch(toggleHighConfidenceAlertsForDeforestationAlertsLayers());
                  }
                }

                gtag('event', 'layer toggle', {
                  event_category: 'Map Click',
                  event_label: `user turned the ${nowHiddenLayer.id} layer off`,
                });
              }
            });
          }
        });
      }
    }

    if (Object.keys(prevState.gfwListDef).length > Object.keys(gfwListDef).length) {
      // Removing GFW list layer from Sidebar panel

      const activeLayerId = Object.keys(prevState.gfwListDef)[0];
      const activeGFWLayer = this.view.map.findLayerById(activeLayerId);

      if (activeGFWLayer?.sublayers) {
        const defExpression = '1=1';
        activeGFWLayer.sublayers.items.forEach((sublayer) => {
          sublayer.definitionExpression = defExpression;
        });
      } else {
        this._removeCustomGfwVectorTileLayer();
      }
    } else if (Object.keys(prevState.gfwListDef).length < Object.keys(gfwListDef).length) {
      // Adding GFW list layer to Sidebar panel

      const activeLayerId = Object.keys(gfwListDef)[0];
      const activeGFWLayer = this.view.map.findLayerById(activeLayerId);
      this.activeGFWLayer = activeGFWLayer;
      const locationsIDs = gfwListDef[activeLayerId];

      if (activeGFWLayer) {
        activeGFWLayer?.when((gfwLayer) => {
          this._setCustomGfwVectorTileLayer(locationsIDs, gfwLayer);
        });
      } else {
        this._setCustomGfwVectorTileLayer(locationsIDs);
      }
    }

    if (
      prevState.visibleLayers !== visibleLayers &&
      (this.view.graphics.items.length > 0 ||
        drawnGraphic.length > 0 ||
        activeAnalysis === 'region')
    ) {
      const disablePolygon = !visibleLayers.some(
        (visibleLayer) => exclusiveDrawLayers.indexOf(visibleLayer) !== -1
      );
      if (disablePolygon && (drawnGraphic.length === 0 || activeAnalysis === 'region')) {
        if (drawnGraphic.length === 0) {
          drawnGraphic.push(this.view.graphics.items[0]);
          this.view.graphics.removeAll();
        }
        store.dispatch(analysisActions.setAnalysis(''));
      } else if (!disablePolygon && (drawnGraphic.length > 0 || activeAnalysis === 'region')) {
        if (drawnGraphic.length > 0) {
          this.view.graphics.add(drawnGraphic[0]);
          drawnGraphic.pop();
        }
        store.dispatch(analysisActions.setAnalysis('analysis'));
        this.updateActiveAnalysis();
      }
    }

    if (prevState.modalLayerInfo !== modalLayerInfo && modalLayerInfo) {
      const info = layerInfoCache.get(modalLayerInfo.metadataId);
      if (info) {
        this.showLayerModal(info);
      } else {
        layerInfoCache.fetch(modalLayerInfo).then(this.showLayerModal);
      }
    }

    if (prevState.canopyDensity !== canopyDensity) {
      this.updateActiveAnalysis();
    }

    if (
      prevState.showHighConfidenceAlertsOnDeforestationAlertsLayer !==
      showHighConfidenceAlertsOnDeforestationAlertsLayer
    ) {
      this.updateActiveAnalysis();
    }

    if (prevState.landsatYear !== landsatYear) {
      const landsatLayer = this.view.map.findLayerById('landsat');
      const index = this.view.map.layers.findIndex((l) => l.id === 'landsat');

      if (!landsatLayer.visible) {
        this.changeBasemap('landsat');
      }

      const duplicate = landsatLayer;
      if (this.view.zoom >= 12) {
        duplicate.urlTemplate = `https://production-api.globalforestwatch.org/v2/landsat-tiles/${landsatYear}/{level}/{col}/{row}.png`;
      } else {
        duplicate.urlTemplate = `https://production-api.globalforestwatch.org/v2/landsat-tiles/${landsatYear}/{level}/{col}/{row}`;
      }

      const promise = new Promise((resolve) => {
        this.view.map.remove(landsatLayer);
        setTimeout(() => {
          resolve();
        }, 100);
      });
      promise.then(() => {
        this.view.map.add(duplicate);
        duplicate.visible = true;
        this.view.map.layers.reorder(duplicate, index);
      });
    }

    if (prevState.soyYear !== soyYear) {
      const soyLayer = this.view.map.findLayerById(soyPlantedArea);
      const index = this.view.map.layers.findIndex((l) => l.id === soyPlantedArea);
      const duplicate = soyLayer;
      const soyConfig = this.state.mapLayers.find((l) => l.id === soyPlantedArea);
      const newURL = soyConfig.layerConfig.body.url.replace('{year}', `${soyYear}`);
      duplicate.urlTemplate = newURL;

      const promise = new Promise((resolve) => {
        this.view.map.remove(soyLayer);
        setTimeout(() => {
          resolve();
        }, 100);
      });
      promise.then(() => {
        this.view.map.add(duplicate);
        duplicate.visible = true;
        this.view.map.layers.reorder(duplicate, index);
      });
    }

    if (
      prevState.planetTileLayer !== planetTileLayer ||
      prevState.planetTileColor !== planetTileColor
    ) {
      const planetColorValue = store.getState().planetTileColor;
      const planetBasemapLayer = this.view.map.findLayerById(PLANET_BASEMAP);
      const index = this.view.map.layers.findIndex((l) => l.id === PLANET_BASEMAP);

      if (!planetBasemapLayer.visible) {
        this.changeBasemap(PLANET_BASEMAP);
      }

      const duplicate = planetBasemapLayer;
      duplicate.urlTemplate = `${window.location.origin}/map/getPlanetTile/basemaps/v1/planet-tiles/${planetTileLayer}/gmap/{level}/{col}/{row}.png?proc=${planetColorValue}`;

      const promise = new Promise((resolve) => {
        this.view.map.remove(planetBasemapLayer);
        resolve();
      });
      promise.then(() => {
        this.view.map.add(duplicate);
        duplicate.visible = true;
        this.view.map.layers.reorder(duplicate, index);
      });
    }

    const { gladDateRange, biomassRange } = this.state;

    if (
      prevState.gladDateRange?.start !== gladDateRange?.start ||
      prevState.gladDateRange?.end !== gladDateRange?.end
    ) {
      this.updateActiveAnalysis();
    }

    if (
      prevState.biomassRange?.min !== biomassRange?.min ||
      prevState.biomassRange?.max !== biomassRange?.max
    ) {
      this.updateActiveAnalysis();
    }

    if (prevState.fireDays !== this.state.fireDays) {
      const activeFires = this.view.map.findLayerById(viirsActiveFiresID);
      const viirsLayerConfig = this.state.mapLayers.find((l) => l.id === viirsActiveFiresID);
      const newViirsLayer = viirsLayer(
        viirsActiveFiresID,
        viirsLayerConfig.url,
        true,
        viirsLayerConfig.order,
        this.state.fireDays
      );
      this.view.map.remove(activeFires);
      this.view.map.add(newViirsLayer);
      this.updateActiveAnalysis();
    }

    if (!prevState.drawingActive && this.state.drawingActive) {
      this.state.drawnCoordinates = [];
    }
  }

  updateActiveAnalysis() {
    const { activeAnalysis, adminArea } = this.state;
    if (activeAnalysis === 'draw' && this.view.graphics.items.length > 0) {
      this.analyzeCustom(this.view.graphics.items[0]);
    } else if (
      activeAnalysis === 'region' &&
      Object.keys(adminArea).length !== 0 &&
      adminArea.constructor === Object
    ) {
      this.analyzeAdmin(adminArea);
    }
  }

  showLayerModal = (layerInfo) => {
    store.dispatch(showLoading(''));
    if (layerInfo) {
      store.dispatch(showLayerInfo(layerInfo));
    } else {
      store.dispatch(showLayerInfo({}));
    }
  };

  mapLoaded = (view) => {
    const { userInfo } = this.state;
    const { access_level_id } = userInfo;

    const popupSubscribeAction = {
      title: 'Add Location',
      id: 'ADD LOCATION',
      className: 'map-popup-subscribe',
      visible: false,
    };

    const popupAnalyzeAction = {
      title: 'Analyze',
      id: 'ANALYZE',
      className: 'map-popup-analyze',
      visible: false,
    };

    this.addProLayers(view);
    this.addCustomBasemaps(view);

    this.view = view;

    this.goToOriginalPoint = () => {
      this.view.goTo({
        center: DEFAULT_MAPVIEW_CENTER,
        zoom: 3,
      });
    };

    const customActions = [popupAnalyzeAction];
    if (access_level_id !== 3) {
      customActions.push(popupSubscribeAction);
    }

    // Remove the default popup actions (e.g. zoom)
    this.view.popup.viewModel.includeDefaultActions = false;
    this.view.popup.actions = customActions;
    this.defaultPopupActions = customActions;

    this.initializeSketchViewModel(view);

    view.popup.on('trigger-action', this.fireActions);

    view.popup.watch('visible', () => {
      const analyzeAction = this.view.popup.actions.items.find((item) => item.id === 'ANALYZE');
      if (analyzeAction) {
        const analysisEnabledLayerExists = this.state.visibleLayers.some((l) =>
          exclusiveLayers.includes(l)
        );
        analyzeAction.visible = analysisEnabledLayerExists;
      }
    });

    /**
     * Reset `selectedFeature` state and selected graphic
     */
    view.popup.watch('visible', (popupOpen) => {
      const { popupSelectedFeature } = this.state;
      if (!popupOpen && popupSelectedFeature) {
        popupSelectedFeature.symbol = fillSymbolDefault;
        const popupLayer = popupSelectedFeature.layer;

        if (popupLayer && popupLayer.graphics && popupSelectedFeature.attributes) {
          const idAttribute = popupSelectedFeature.attributes.ID ? 'ID' : 'location_id';
          const id = popupSelectedFeature.attributes[idAttribute];
          popupLayer.graphics.items.forEach((item) => {
            if (item.attributes[idAttribute] === id && item.symbol.type === 'simple-marker') {
              item.symbol = centroidSymbol;
            }
          });
        }
      }
    });

    /**
     * Handle `selectedFeature` state and selected graphic
     */
    view.popup.watch('selectedFeature', (selectedFeature) => {
      const { popupSelectedFeature } = this.state;
      if (selectedFeature) {
        // Feature selected
        if (selectedFeature && popupSelectedFeature) {
          popupSelectedFeature.symbol = fillSymbolDefault;
          selectedFeature.symbol = fillSymbolHighlight;
        } else {
          selectedFeature.symbol = fillSymbolHighlight;
        }

        const popupLayer = selectedFeature.layer;
        if (popupLayer && popupLayer.graphics && selectedFeature.attributes) {
          const idAttribute = selectedFeature.attributes.ID ? 'ID' : 'location_id';
          const id = selectedFeature.attributes[idAttribute];

          popupLayer.graphics.items.forEach((item) => {
            if (item.attributes[idAttribute] === id && item.symbol.type === 'simple-marker') {
              item.symbol = centroidHighlightSymb;
            } else if (item.symbol.type === 'simple-marker') {
              item.symbol = centroidSymbol;
            }
          });
        } else if (!popupLayer) {
          const userLocationsPresent = view.popup.features.some((feat) => {
            if (feat.layer && feat.layer.id === 'user-locations') {
              return true;
            }
          });

          if (userLocationsPresent) {
            const poplaya = this.view.map.findLayerById('user-locations');
            poplaya.graphics.items.forEach((item) => {
              if (item.symbol.type === 'simple-marker') {
                item.symbol = centroidSymbol;
              }
            });
          }
        }

        this.setState({ popupSelectedFeature: selectedFeature });
      } else {
        // No feature selected
        if (popupSelectedFeature) {
          popupSelectedFeature.symbol = fillSymbolDefault;
        }
      }
    });

    view.on('click', (evt) => {
      //Handles click on regular non-vector layers
      const initHitTest = () => {
        view.hitTest(evt).then(() => {
          this.executeIdentifyTask(evt);
        });
      };

      //Check if we have any vector tile layers that have features in general and if those layers are visible on map
      //otherwise we do not need to do anything except to ignore it
      const activeVectorLayers = vectorEnabledLayers.filter((layerID) => {
        const layerOnMap = this.view.map.findLayerById(layerID);
        return layerOnMap && layerOnMap.visible;
      });

      //Vector tile layers take priority over "normal" layers
      if (activeVectorLayers.length > 0) {
        this.fetchFeaturesFromVector(activeVectorLayers, evt, initHitTest);
      } else {
        initHitTest();
      }
    });

    const sketchEventListener = view.on('double-click', (event) => {
      //If sketch is in progress and we double click > we need to complete it. If sketch is not in progress and we double click map, we just ignore it
      if (!this.sketchViewModel || this.sketchViewModel.state === 'ready') {
        return;
      }

      event.stopPropagation();
      this.sketchViewModel.complete();
    });

    this.setState(sketchEventListener);
  };

  initializeSketchViewModel = (view) => {
    const sketchViewModel = new SketchViewModel({
      view,
      layer: view.graphics,
      polygonSymbol: {
        type: 'simple-fill',
        color: [151, 189, 61, 0.65],
        outline: {
          color: [151, 189, 61, 1],
          width: 1,
        },
      },
    });
    this.sketchViewModel = sketchViewModel;

    sketchViewModel.on('create', (event) => {
      if (event.state === 'complete') {
        const symbol = new SimpleFillSymbol({
          color: [227, 139, 79, 0.8],
          outline: {
            color: [255, 255, 255],
            width: 1,
          },
        });

        const graphic = new Graphic({
          geometry: event.graphic.geometry,
          symbol: symbol,
        });
        view.graphics.add(graphic);
        this.analyzeCustom(graphic);
        store.dispatch(toggleDrawing());

        this.state.drawnCoordinates.forEach((coordinate) =>
          addCoordinateTextFromPoint(view, coordinate)
        );
      }
    });
    store.dispatch(saveSketchTool(sketchViewModel));
  };

  executeIdentifyTask = (evt) => {
    const allLayers = this.view.map.layers.items.filter((l) => !vectorEnabledLayers.includes(l.id));
    const deferreds = [];

    allLayers.forEach((layer) => {
      if (layer.visible) {
        const layerConfig = utils.getObject(mapLayersMenu, 'id', layer.id);
        if (layerConfig && layerConfig.popupTemplate) {
          deferreds.push(identifyPoints(layer, evt, this.view));
        }
      }
    });
    Promise.all(deferreds).then((response) => {
      const popFeats = [];
      response.forEach((layer) => {
        layer?.response?.results?.forEach((result) => {
          const popupTemplate = utils.getObject(mapLayersMenu, 'id', layer.layer).popupTemplate;
          result.feature.popupTemplate = popupTemplate;
          result.feature.layerName = layer.layer;
          popFeats.push(result.feature);
        });
      });

      if (popFeats.length > 0) {
        this.view.popup.features.forEach((feat) => {
          popFeats.unshift(feat);
        });

        this.view.popup.open({
          features: popFeats,
          location: evt.mapPoint,
        });
      }

      if (this.state.drawingActive) {
        this.state.drawnCoordinates.push(evt.mapPoint);
        addCoordinateTextFromPoint(this.mapView, evt.mapPoint);
      }
    });
  };

  fetchFeaturesFromVector = async (layerIDs, evt, initHitTest) => {
    const createFeatureForPopup = (featureAttributes, popupContent, event) => {
      const markerSymbol = {
        type: 'simple-marker',
        color: [226, 119, 40],
      };
      const pTemplate = new PopupTemplate({
        title: popupContent.title,
        content: popupContent.content,
      });
      const popF = new Graphic({
        geometry: event.mapPoint,
        symbol: markerSymbol,
        attributes: featureAttributes,
        popupTemplate: pTemplate,
      });
      return popF;
    };

    const openPopup = (features, location, layerID) => {
      if (this.state.drawingActive) {
        return;
      }
      //disable popup actions for VIIRS layers, this may need to be adjusted in the future as we move other layers to vector tile cache layers
      if (layerID === viirsActiveFiresID) {
        this.view.popup.open({
          features: features,
          location: location,
          actions: '',
        });
      } else {
        this.view.popup.open({
          features: features,
          location: location,
          actions: this.defaultPopupActions,
        });
      }
    };

    //iterate over vector layerIDs and if we get to a layer that has features, we open popup with it,
    let featuresExist = false;
    for (let i = 0; i < layerIDs.length; i++) {
      const layerID = layerIDs[i];
      //We handle viirs fires layer feature fetching slighty differently due to the date range
      if (layerID === viirsActiveFiresID) {
        const viirsLayerConfig = this.state.mapLayers.find((l) => l.id === viirsActiveFiresID);
        const viirsFeatures = await fetchViirsFeatures(
          viirsLayerConfig,
          this.state.fireDays,
          evt.mapPoint.latitude,
          evt.mapPoint.longitude,
          this.view.zoom
        );

        if (viirsFeatures.length === 0) {
          continue;
        }

        const popContent = {
          title: 'VIIRS Fire Alerts',
          content:
            '<p><strong>LATITUDE: </strong>{latitude}</p>' +
            '<p><strong>LONGITUDE: </strong>{longitude}</p>' +
            '<p><strong>CONFIDENCE: </strong>{confidence__cat}</p>' +
            '<p><strong>BRIGHTNESS: </strong>{bright_ti4__K}</p>' +
            '<p><strong>ALERT DATE: </strong>{alert__date}</p>' +
            '<p><strong>ALERT TIME: </strong>{alert__time_utc}</p>',
        };
        const popFeats = viirsFeatures.map((f) => {
          return createFeatureForPopup(f, popContent, evt);
        });
        openPopup(popFeats, evt.mapPoint, layerID);
        featuresExist = true;
        break;
      } else {
        //all other vector layers are handled the same way
        const vectorLayerConfig = this.state.mapLayers.find((l) => l.id === layerID);
        let featureAPIURL = vectorLayerConfig.interactionConfig.config.url;
        const params = `?lat=${evt.mapPoint.latitude}&lng=${evt.mapPoint.longitude}&z=${this.view.zoom}`;
        featureAPIURL = featureAPIURL.concat(params);

        const features = await fetch(featureAPIURL)
          .then((res) => res.json())
          .then((data) => data.data)
          .catch((e) => console.log(e));

        if (features.length === 0) {
          continue;
        }

        //get the popup config info
        const vectorLayerPopupInfo = mapLayersMenu.find((l) => l.id === layerID);
        if (vectorLayerPopupInfo) {
          const popContent = {
            title: vectorLayerPopupInfo.popupTemplate.title,
            content: vectorLayerPopupInfo.popupTemplate.content,
          };
          const popFeats = features.map((f) => {
            const featureObject = {
              ...f,
              layerName: layerID,
            };
            return createFeatureForPopup(featureObject, popContent, evt);
          });
          openPopup(popFeats, evt.mapPoint);
        } else {
          console.log(`Popup info not defined for layer ${layerID}`);
        }
        featuresExist = true;
        break;
      }
    }

    //We went through all vector layers and found no featues, initialize hitTest for all other layers
    if (!featuresExist) {
      initHitTest();
    }
  };

  fireActions = (evt) => {
    const feat = this.state.popupSelectedFeature;
    const geometry = feat.geometry.spatialReference.isGeographic
      ? feat.geometry
      : webMercatorToGeographic(feat.geometry);
    const selectedMapFeatureAttributes = feat.attributes;

    if (!feat.layerName && feat.sourceLayer && feat.sourceLayer.id) {
      if (feat.sourceLayer.id.indexOf) {
        const layerIds = feat.sourceLayer.id.split('_feat');
        if (layerIds.length) {
          feat.layerName = layerIds[0];
        }
      }
    }

    if (evt.action.id === 'ADD LOCATION') {
      let name = '';
      let listName = '';
      let geom = geometry;
      const globalIds = [];

      const lName = feat?.layerName ? feat.layerName : feat.attributes.layerName;
      switch (lName) {
        case protectedAreas:
          name = selectedMapFeatureAttributes.name;
          globalIds.push(selectedMapFeatureAttributes.gfw_geostore_id);
          listName = protectedAreas;
          geom = {};
          break;
        case viirsActiveFiresID:
          name = 'Active Fire';
          break;
        case brazilBiomesID:
          name = selectedMapFeatureAttributes.name;
          break;
        case treePlantationsSpecies:
          name = selectedMapFeatureAttributes.type_text;
          break;
        /* case treePlantationsType:
          name = selectedMapFeatureAttributes.type_text;
          break; */
        case rspoConcessions:
          name = selectedMapFeatureAttributes.plantation;
          globalIds.push(selectedMapFeatureAttributes.gfw_geostore_id);
          listName = rspoConcessions;
          geom = {};
          break;
        case oilPalmConcessions:
          name = selectedMapFeatureAttributes.name;
          globalIds.push(selectedMapFeatureAttributes.gfw_geostore_id);
          listName = oilPalmConcessions;
          geom = {};
          break;
        case universalMillList:
          name = selectedMapFeatureAttributes.mill_name;
          globalIds.push(selectedMapFeatureAttributes.uml_id);
          listName = universalMillList;
          geom = {};
          break;
        case rspoPalmOilMills:
          name = selectedMapFeatureAttributes.mill_name_;
          globalIds.push(selectedMapFeatureAttributes.globalid);
          listName = rspoPalmOilMills;
          geom = {};
          break;
        case userLocations:
          name = selectedMapFeatureAttributes['Location Name'];
          globalIds.push(selectedMapFeatureAttributes.gadmid);
          listName = userLocations;
          break;
        default:
          name = selectedMapFeatureAttributes['Location Name']
            ? selectedMapFeatureAttributes['Location Name']
            : selectedMapFeatureAttributes['Investment Name'];
      }

      this.setState({
        esriJson: geom,
        locationName: name,
        globalIds: globalIds,
        activeGFWList: listName,
        selectedMapFeatureAttributes: selectedMapFeatureAttributes,
      });

      const adminObj = {
        country: selectedMapFeatureAttributes['Country'],
        region: selectedMapFeatureAttributes['State'],
        gadmId: selectedMapFeatureAttributes.gadmid,
      };
      this.locationsAfterState(adminObj);
    } else if (evt.action.id === 'ANALYZE') {
      // Open the analysis widget tab from popup
      store.dispatch(analysisActions.setAnalysis('analysis'));

      const customGraphic = new Graphic({
        geometry: geometry,
        attributes: feat.attributes,
      });
      this.analyzeCustom(customGraphic, 'gfw');
    }
  };

  locationsAfterState = async (adminObj) => {
    const { selectedLists } = this.state;
    const [selectedList] = selectedLists;

    if (adminObj?.gadmId) {
      const geom = await getLocationGeometry(this.props, this.view, selectedList);

      this.setState(
        {
          esriJson: geom,
          locationName: adminObj.region ? adminObj.region : adminObj.country,
          globalIds: [adminObj.gadmId], // adminObj.gadmId,
          activeGFWList: adminAreas,
        },
        this.goToLocations
      );
    } else {
      if (this.view.popup.features && this.view.popup.features.length) {
        const feat = this.view.popup.features[this.view.popup.selectedFeatureIndex];
        const layerName = feat.layerName ? feat.layerName : feat.attributes.layerName;
        const userList = this.state.selectedLists ? this.state.selectedLists[0] : false;
        if (userList && feat && feat.attributes && feat.attributes.list_id === userList.id) {
          this.setState(
            {
              // user list location from analysis results panel
              selectedMapFeatureAttributes: feat.attributes,
            },
            this.goToLocations
          );
        } else if (layerName) {
          let name = '';
          let listName = '';
          const globalIds = [];
          let geom;

          geom = await getLocationGeometry(this.props, this.view, selectedList);

          switch (layerName) {
            case protectedAreas:
              name = feat.attributes.name;
              globalIds.push(feat.attributes.gfw_geostore_id);
              listName = protectedAreas;
              geom = {};
              break;
            case viirsActiveFiresID:
              name = 'Active Fire';
              break;
            case brazilBiomesID:
              name = feat.attributes.name;
              break;
            case treePlantationsSpecies:
              name = feat.attributes.type_text;
              break;
            /* case treePlantationsType:
              name = feat.attributes.type_text;
              break; */
            case rspoConcessions:
              name = feat.attributes.plantation;
              globalIds.push(feat.attributes.gfw_geostore_id);
              listName = rspoConcessions;
              geom = {};
              break;
            case oilPalmConcessions:
              name = feat.attributes.name;
              globalIds.push(feat.attributes.gfw_geostore_id);
              listName = oilPalmConcessions;
              geom = {};
              break;
            case universalMillList:
              name = feat.attributes.mill_name;
              globalIds.push(feat.attributes.uml_id);
              listName = universalMillList;
              geom = {};
              break;
            case rspoPalmOilMills:
              name = feat.attributes.mill_name_;
              globalIds.push(feat.attributes.globalid);
              listName = rspoPalmOilMills;
              geom = {};
              break;
            case userLocations:
              name = feat.attributes['Location Name'];
              globalIds.push(feat.attributes.gadmid);
              listName = userLocations;
              break;
            default:
              name = feat.attributes['Location Name']
                ? feat.attributes['Location Name']
                : feat.attributes['Investment Name'];
          }

          const state = {
            // user list location from analysis results panel
            esriJson: geom,
            locationName: name,
            globalIds,
            activeGFWList: listName,
          };

          this.setState(state, this.goToLocations);
        } else {
          this.goToLocations();
        }
      } else {
        this.goToLocations();
      }
    }
  };

  setGeometry = (geom) => {
    if (geom) {
      if (geom.latitude && geom.longitude) {
        geom = GeometryEngine.geodesicBuffer(geom, 1, 'kilometers');
      }

      const symbol = new SimpleFillSymbol({
        color: [227, 139, 79, 0.8],
        outline: {
          color: [255, 255, 255],
          width: 1,
        },
      });

      const customGraphic = new Graphic({
        geometry: geom,
        symbol: symbol,
      });

      this.view.graphics.add(customGraphic);
      this.view.goTo(customGraphic);
      this.analyzeCustom(customGraphic);
    } else {
      this.view.graphics.removeAll();
    }
  };

  geostoreAnalysisCall = async (totalAreaHa, type, geostoreID, origin = 'rw') => {
    this.setState({ spinnerOn: true });

    if (type === 'viirs' || type === 'prodes') {
      let queryURL;

      if (type === 'viirs') {
        const fireDayStart = moment(new Date())
          .subtract(this.state.fireDays, 'days')
          .format('YYYY-MM-DD');
        queryURL = `${DATA_API_URL}/dataApi/analysisVIIRS/?geostore_origin=${origin}&geostoreID=${geostoreID}&fireDayStart=${fireDayStart}`;
      }

      if (type === 'prodes') {
        const { startYear, endYear } = this.state.prodesDateRange;
        queryURL = `${DATA_API_URL}/dataApi/analysisPRODES/?geostore_origin=${origin}&geostoreID=${geostoreID}&startYear=${startYear}&endYear=${endYear}`;
      }

      fetch(queryURL, {
        method: 'POST',
      })
        .then((res) => res.json())
        .then((data) => {
          const alertSum = data.data.reduce((acc, val) => acc + val.alert__count, 0);
          const analysisResults = {
            data: {
              attributes: {
                areaHa: totalAreaHa.toFixed(2),
                value: alertSum,
              },
              type: `${type}-alerts`,
            },
          };
          this.setState({ spinnerOn: false });
          store.dispatch(updateAnalysis(analysisResults));
        })
        .catch((err) => {
          console.log('Request Error:', err);
          const details = {
            dialogTitle: 'Analysis Failure',
            dialogMessage: 'The analysis call on this custom feature failed.',
          };
          this.cancelAnalysis(details);
        });
    }

    if (type === 'glad') {
      //get the URL first, then fetch the data and update the store
      const dataApi__analysisGLAD = `${DATA_API_URL}/dataApi/analysisGLAD/`;
      const GROUP_BY_COLUMN = 'umd_glad_landsat_alerts__date';
      const start_date = moment(this.state.gladDateRange.start).format('YYYY-MM-DD');
      const end_date = moment(this.state.gladDateRange.end).format('YYYY-MM-DD');
      const analysisURL = `${dataApi__analysisGLAD}?geostore_origin=${origin}&geostoreID=${geostoreID}&group_by=${GROUP_BY_COLUMN}&start_date=${start_date}&end_date=${end_date}`;

      fetch(analysisURL, {
        method: 'POST',
      })
        .then((res) => res.json())
        .then((data) => {
          const alertSum = data.data.reduce((acc, val) => {
            return acc + val.count;
          }, 0);
          const analysisResults = {
            data: {
              attributes: {
                areaHa: totalAreaHa.toFixed(2),
                value: alertSum.toFixed(2),
              },
              type: 'glad-alerts',
            },
          };
          this.setState({ spinnerOn: false });
          store.dispatch(updateAnalysis(analysisResults));
        })
        .catch((err) => {
          console.log('Request Error:', err);
          const details = {
            dialogTitle: 'Analysis Failure',
            dialogMessage: 'The analysis call on this custom feature failed.',
          };
          this.cancelAnalysis(details);
        });
    }

    if (type === 'tree biomass') {
      const SQL_SUM__TreeBiomassLoss = 'gfw_forest_carbon_gross_emissions__Mg_CO2e';
      const SQL_SUM__TreeBiomassTotal = 'whrc_aboveground_biomass_stock_2000__Mg';
      const dataApi__TreeBiomassLoss = `${DATA_API_URL}/dataApi/analysisTreeBiomassLoss/`;
      const dataApi__TreeBiomassTotal = `${DATA_API_URL}/dataApi/analysisTreeBiomassTotal/`;
      const analysisURL__TreeBiomassLoss = `${dataApi__TreeBiomassLoss}?geostore_origin=${origin}&geostoreID=${geostoreID}&group_by=umd_tree_cover_loss__year&sum=${SQL_SUM__TreeBiomassLoss}&startYear=${this.state.biomassLossDateRange.startYear}&endYear=${this.state.biomassLossDateRange.endYear}&filter=umd_tree_cover_density_2000__threshold&filter_value=${this.state.canopyDensity}`;
      const analysisURL__TreeBiomassTotal = `${dataApi__TreeBiomassTotal}?geostore_origin=${origin}&geostoreID=${geostoreID}&sum=${SQL_SUM__TreeBiomassTotal}`;
      let bioLossResponse;
      let bioLossTotalResponse;

      try {
        bioLossResponse = await fetch(analysisURL__TreeBiomassLoss, {
          method: 'POST',
        })
          .then((res) => res.json())
          .then((data) => {
            return (
              data &&
              data.data &&
              data.data.reduce((acc, val) => {
                return acc + val[SQL_SUM__TreeBiomassLoss];
              }, 0)
            );
          });

        bioLossTotalResponse = await fetch(analysisURL__TreeBiomassTotal, {
          method: 'POST',
        })
          .then((res) => res.json())
          .then((data) => {
            return (
              data &&
              data.data &&
              data.data.reduce((acc, val) => {
                return acc + val[SQL_SUM__TreeBiomassTotal];
              }, 0)
            );
          });
      } catch (e) {
        console.log('Request Error:', e);
      }

      const analysisResults = {
        data: {
          attributes: {
            areaHa: totalAreaHa.toFixed(2),
            biomassLoss: bioLossResponse ? bioLossResponse.toFixed(2) : 'n/a',
            biomass: bioLossTotalResponse ? bioLossTotalResponse.toFixed(2) : 'n/a',
          },
          type: 'biomasses',
        },
      };
      this.setState({ spinnerOn: false });
      store.dispatch(updateAnalysis(analysisResults));
    }

    if (type === 'tree cover') {
      const { endYear, startYear } = this.state.treeCoverLossDateRange;
      const SQL_SUM__FIELD = 'area__ha';
      const dataApi__TreeCoverLoss = `${DATA_API_URL}/dataApi/analysisTreeCoverLoss/`;
      const dataApi__TreeCoverGain = `${DATA_API_URL}/dataApi/analysisTreeCoverGain/`;
      const analysisURL__TreeCoverLoss = `${dataApi__TreeCoverLoss}?geostore_origin=${origin}&geostoreID=${geostoreID}&sum=${SQL_SUM__FIELD}&startYear=${startYear}&endYear=${endYear}&filter=umd_tree_cover_density_2000__threshold&filter_value=${this.state.canopyDensity}`;
      const analysisURL__TreeCoverGain = `${dataApi__TreeCoverGain}?geostore_origin=${origin}&geostoreID=${geostoreID}&sum=${SQL_SUM__FIELD}`;
      let lossSum;
      let gainSum;

      try {
        lossSum = await fetch(analysisURL__TreeCoverLoss, {
          method: 'POST',
        })
          .then((res) => res.json())
          .then((data) => {
            return (
              data &&
              data.data &&
              data.data.reduce((acc, val) => {
                return acc + val[SQL_SUM__FIELD];
              }, 0)
            );
          });

        gainSum = await fetch(analysisURL__TreeCoverGain, {
          method: 'POST',
        })
          .then((res) => res.json())
          .then((data) => {
            return data && data.data[SQL_SUM__FIELD];
          });
      } catch (e) {
        console.log('Request Error:', e);
      }
      const analysisResults = {
        data: {
          attributes: {
            areaHa: totalAreaHa.toFixed(2),
            loss: lossSum ? lossSum.toFixed(2) : 'n/a',
            gain: gainSum ? gainSum.toFixed(2) : 'n/a',
          },
          type: 'umd',
        },
      };
      this.setState({ spinnerOn: false });
      store.dispatch(updateAnalysis(analysisResults));
    }
  };

  analyzeCustom = async (graphic, origin) => {
    // Need to convert to geographic coordinates;
    const { geometry, attributes } = graphic;

    // Adhoc analysis requires the geometries' spatial reference to be geographic (wkid 4326)
    const geographicGeometry = geometry.spatialReference.isGeographic
      ? geometry
      : webMercatorToGeographic(geometry);
    const geojsonGeometry = geojsonUtil.arcgisToGeoJSON(geographicGeometry);
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: geojsonGeometry,
        },
      ],
    };

    let geostoreResponse;
    let geostoreID;
    if (origin === 'gfw' && graphic.attributes.gfw_geostore_id) {
      geostoreID = graphic.attributes.gfw_geostore_id;
      const gRes = {
        data: {
          attributes: {
            areaHa: graphic.attributes.gfw_area__ha,
          },
        },
      };
      geostoreResponse = gRes;
    } else {
      //Ensure that we are using the right geostore origin (any drawn/non gfw list geostore ID is "rw" origin)
      origin = 'rw';
      geostoreResponse = await registerGeometry(geojson).then((r) =>
        r.status === 200 ? r.json() : null
      );
      geostoreID = geostoreResponse ? geostoreResponse.data.id : null;
    }

    // Get the correct microservice to run adhoc analysis on
    const microservice = this.getCurrentAnalysis('custom');
    let locationName;

    if (attributes) {
      if (attributes['Location Name']) {
        locationName = attributes['Location Name'];
      } else if (attributes['Investment Name']) {
        locationName = attributes['Investment Name'];
      }
    }

    this.setState({
      esriJson: geographicGeometry,
      activeGFWList: '',
      spinnerOn: true,
      locationName: locationName ? locationName : 'Custom Polygon', //TODO: use this if cant get a Name off of the graphic??
    });

    if (supportedGeostoreAnalysis.includes(microservice.type)) {
      this.geostoreAnalysisCall(
        geostoreResponse.data.attributes.areaHa,
        microservice.type,
        geostoreID,
        origin
      );
    }
  };

  setLocationName = (name) => {
    this.setState({ locationName: name });
  };

  goToLocations = () => {
    const { esriJson, locationName, globalIds, activeGFWList, selectedMapFeatureAttributes } =
      this.state;

    this.setState({ spinnerOn: false });
    const geoString = JSON.stringify(esriJson);

    const requestObject = {
      goToEditList: true,
      locationName: locationName,
    };

    if (geoString !== '{}') {
      requestObject.drawData = geoString;
      if (selectedMapFeatureAttributes) {
        //User List >> send 'mapData'
        requestObject.mapData = {
          listID: selectedMapFeatureAttributes.list_id,
          locationID: selectedMapFeatureAttributes.location_id,
        };
      }
    } else if (selectedMapFeatureAttributes && !globalIds.length) {
      requestObject.mapData = {
        listID: selectedMapFeatureAttributes.list_id,
        locationID: selectedMapFeatureAttributes.location_id,
      };
    } else if (globalIds.length) {
      //GFW List
      requestObject.gfwData = {
        listName: activeGFWList,
        globalIds: globalIds,
        featureAttributes: selectedMapFeatureAttributes,
      };
    }

    // set location data to add to a new list
    localStorage.setItem('locationDataToAddFromMap', JSON.stringify(requestObject));

    window.location.href = '/locations';
  };

  getCurrentAnalysis = (type) => {
    let analysisType = 'tree cover';
    // const threshold = this.state.canopyDensity; //TODO: Add other layer-specific query params!
    const { canopyDensity, fireDays, prodesDateRange } = this.state;

    let microservice;
    if (this.state.visibleLayers.includes(prodesDeforestationID)) {
      microservice = `https://production-api.globalforestwatch.org/v1/prodes-loss?period=${prodesDateRange.startYear}-01-01%2C${prodesDateRange.endYear}-12-31&thresh=${canopyDensity}`;
      analysisType = 'prodes';
    } else if (this.state.visibleLayers.includes(treeBiomassLossID)) {
      analysisType = 'tree biomass';
    } else if (this.state.visibleLayers.includes(gladAlertsID)) {
      analysisType = 'glad';
    } else if (this.state.visibleLayers.includes(viirsActiveFiresID)) {
      const currentDate = moment(new Date()).format('YYYY-MM-DD');
      const fireDayStart = moment(new Date()).subtract(fireDays, 'days').format('YYYY-MM-DD');
      microservice = `https://production-api.globalforestwatch.org/v1/viirs-active-fires?period=${fireDayStart}%2C${currentDate}&thresh=${canopyDensity}`;
      analysisType = 'viirs';
    }

    //TODO: Should we combine these two events?
    gtag('event', 'analyses activate', {
      event_category: 'Map Click',
      event_label: `user ran the ${analysisType} analysis against ${
        type === 'admin' ? 'an administrative' : 'a custom'
      } area`,
    });
    gtag('event', 'analyses type', {
      event_category: this.state.activeAnalysis === 'region' ? 'Map Select' : 'Map Draw',
      event_label: `user ran the analysis via ${
        this.state.activeAnalysis === 'region' ? 'selecting a country or region' : 'drawing an area'
      }`,
    });
    return { microservice: microservice, type: analysisType };
  };

  analyzeAdmin = async (data) => {
    //Geostore thresholds that modifies the precision of returned geometry
    const THRESHOLD = '0.05';

    this.setState({ spinnerOn: true });
    const analysisResponse = this.getCurrentAnalysis('admin');

    const analysisType = analysisResponse.type;
    let microserviceUrl = analysisResponse.microservice;

    if (supportedGeostoreAnalysis.includes(analysisType)) {
      const REGION = data.region || '';
      const geostoreAdminURL = `${DATA_API_URL}/dataApi/analysisAdminRegion/?admin=${data.country}&region=${REGION}&thresh=${THRESHOLD}`;

      const geostoreResponse = await fetch(geostoreAdminURL, {
        method: 'POST',
      })
        .then((r) => r.json())
        .then((adminData) => {
          return adminData.data;
        })
        .catch((e) => console.log(e));
      this.geostoreAnalysisCall(
        geostoreResponse.attributes.areaHa,
        analysisType,
        geostoreResponse.id
      );
    } else {
      if (microserviceUrl && (data.country.length || data.region)) {
        // Target the correct administrative boundary
        const index = microserviceUrl.indexOf('?period');
        const countryInfo = `/admin/${data.country}${data.region ? `/${data.region}` : ''}`;
        microserviceUrl = [
          microserviceUrl.slice(0, index),
          countryInfo,
          microserviceUrl.slice(index),
        ].join('');

        currentAnalysisCall = new XMLHttpRequest();
        currentAnalysisCall.onload = () => {
          this.setState({
            spinnerOn: false,
            activeGFWList: adminAreas,
            locationName: data.region ? data.region : data.country,
          });

          const response = JSON.parse(currentAnalysisCall.response);
          if (response.data.type === 'umd') {
            const total = response.data.attributes.total;
            response.data.attributes = total;
          }

          store.dispatch(updateAnalysis(response));
          currentAnalysisCall = '';
        };
        currentAnalysisCall.onerror = (err) => {
          console.log('Request Error:', err);
          const details = {
            dialogTitle: 'Analysis Failure',
            dialogMessage: 'The analysis call on this Administrative Area failed.',
          };

          this.cancelAnalysis(details);
        };
        currentAnalysisCall.open('GET', microserviceUrl);
        currentAnalysisCall.send();
      } else {
        console.log('No microservice');
        this.setState({ spinnerOn: false });
        store.dispatch(updateAnalysis({}));
      }
    }
  };

  setDialogInfo = (info) => {
    this.setState(info);
  };

  addProLayers = async (view) => {
    const { visibleLayers } = this.state;

    const layersData = await fetchGfwProLayers();
    let layers = layersData.map((layerObject) => {
      const layer = constructLayerObject(visibleLayers, layerObject);
      return layer;
    });
    // Remove layers that failed layerObject creation step (due to mismatched config or other reasons)
    layers = layers.filter((l) => l);
    // Sort constructed layers
    layers.sort((a, b) => a.order - b.order);

    this.view.popup.watch('selectedFeatureIndex', (index) => {
      const selectedFeat = this.view.popup.features[index];
      if (selectedFeat) {
        const currentForestChange = visibleLayers.some((layer) => exclusiveLayers.includes(layer));
        this.view.popup.actions.forEach((action) => {
          if (selectedFeat.layerName === viirsActiveFiresID) {
            action.visible = false;
          } else {
            action.visible =
              (action.id === 'ANALYZE' && currentForestChange) ||
              (action.id === 'ADD LOCATION' &&
                noLocationLayers.indexOf(selectedFeat.layerName) === -1 &&
                selectedFeat.attributes?.adm_level !== '0');
          }
        });
      }
    });

    layersToAdd = layerFactory(
      layers.filter((layer) => layer && layer.type !== 'carto'),
      view
    );

    const initialLayers = layersToAdd
      .filter((layer) => visibleLayersConstants.includes(layer.id))
      .sort((layerA, layerB) => {
        if (layerA.order > layerB.order) {
          return -1;
        } else {
          return 1;
        }
      });

    view.map.addMany(initialLayers);
    view.map.add(
      new GraphicsLayer({
        id: USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID,
        visible: true,
      })
    );

    // Add selected Geostore IDs GFW Vector Tile layer
    this._setCustomGfwVectorTileLayer = async (locationIDs, gfwLayer) => {
      if (gfwLayer) {
        // Create Custom GFW Vector Tile Layer
        this.customGfwVectorTileLayer = new VectorTileLayer({
          id: `${gfwLayer.id} - Custom`,
          style: await getVectorTileStyle(locationIDs, gfwLayer),
        });
        view.map.add(this.customGfwVectorTileLayer);
        gfwLayer.opacity = 0;
      }
      try {
        let zoomTarget;
        if (locationIDs.length && locationIDs.length < 200) {
          // Zoom to locations only if we have less than 200 locations and more than 0

          const queryParams = getQueryParams(this.props.location.search);
          const { listId } = queryParams;

          const { data } = await getBBoxAndGeostoreIDs(listId, locationIDs);

          const polyGraphics = [];
          const extents = [];

          data.features.forEach((location) => {
            let feature = location;

            const esriJson = geojsonUtil.geojsonToArcGIS(feature.geometry);

            const polygon = new Polygon({
              rings: esriJson.rings,
              spatialReference: { wkid: 4326 },
            });

            if (polygon.extent) {
              extents.push(polygon.extent);
            }

            const polyGraphic = new Graphic({
              geometry: polygon,
              symbol: fillSymbolDefault,
            });

            polyGraphics.push(polyGraphic);
          });

          const polyLayer = new GraphicsLayer({
            graphics: polyGraphics,
          });
          this.view.map.add(polyLayer);

          if (extents.length > 0) {
            let combinedExtent = extents[0];
            for (let i = 1; i < extents.length; i++) {
              combinedExtent = combinedExtent.union(extents[i]);
            }

            zoomTarget = {
              target: combinedExtent.expand(1.2),
            };
          }
        } else if (gfwLayer) {
          zoomTarget = gfwListsZoomTargets[gfwLayer.id];
        }

        this.goToOriginalPoint = () => {
          this.view.goTo(zoomTarget);
        };

        this.view.goTo(zoomTarget);
      } catch (e) {
        console.log(e);
        throw new Error('Fetching Zoom in BBOX values for GFW List locations failed.');
      }
    };

    this._removeCustomGfwVectorTileLayer = () => {
      if (this.customGfwVectorTileLayer) {
        this.customGfwVectorTileLayer.destroy();
        this.activeGFWLayer.opacity = 1;
      }
    };

    store.dispatch(populateLayers(layers));

    this.applyStateFromUrl();
  };

  applyStateFromUrl = () => {
    const queryParams = getQueryParams(this.props.location.search);

    const { gfwLists } = this.props;
    const {
      visibleLayers,
      listId,
      selectedLocations,
      isGfwList,
      isSharedList,
      selectedTimeframe,
      latitude,
      longitude,
      zoom,
      xmin,
      ymin,
      xmax,
      ymax,
    } = queryParams;

    if (!listId) {
      return; // if there is no list id in the get params, exit this function
    }

    let alertsMapExtent;
    if (xmin && ymin && xmax && ymax) {
      alertsMapExtent = new Extent({
        xmin,
        ymin,
        xmax,
        ymax,
        spatialReference: SpatialReference.WGS84,
      });
    } else {
      alertsMapExtent = null; // Handle the case where extent cannot be calculated
    }

    const gfwListDefinitions = {};
    const hashLayersToAdd = [];

    if (isGfwList) {
      if (!listId || listId < 1 || listId > 5) {
        return; // if the list is not found, exit this function
      }

      const [listToSelect] = gfwLists.filter((gfwList) => gfwList.id === listId);
      const listName = listToSelect.list_name;

      const gfwListVisibleMapLayerId = getMapLayerIdFromGFWListName(listName);
      hashLayersToAdd.push(gfwListVisibleMapLayerId);

      gfwListDefinitions[gfwListVisibleMapLayerId] = [];
      selectedLocations?.forEach((gfwLocation) => {
        gfwListDefinitions[gfwListVisibleMapLayerId].push(gfwLocation);
      });

      this.updateSelectedLists(listToSelect);

      const transitionListData = {
        id: listId,
        numLocations: selectedLocations?.length || listToSelect?.list_locations_count,
        alertsMapExtent,
        name: listName,
        isGfwList: true,
      };

      // set name and selected locations in banner
      this.setState({
        transitionListData,
      });

      // is user list
    } else {
      const { userLists, userSharedLists } = this.props;

      const listToSearch = isSharedList ? userSharedLists[0] : userLists;
      const userList = listToSearch?.find((listData) => listData.id === listId);

      if (!userList) {
        return; // if the list is not found, exit this function
      }

      store.dispatch(showMapLoader(true));
      // set name and selected locations in banner
      this.setState({
        transitionListData: {
          id: listId,
          numLocations: selectedLocations?.length || userList?.list_locations_count,
          name: userList.list_name,
          alertsMapExtent,
        },
      });

      const request = new XMLHttpRequest();
      request.onload = () => {
        store.dispatch(showMapLoader(false));
        if (request.responseText === '') {
          console.log('LIST DATA IS NOT AVAILABLE');
        } else {
          const selectedListData = JSON.parse(request.responseText);
          if (selectedLocations?.length) {
            const feats = selectedListData[0].features;

            const filteredLocations = feats.filter((location) => {
              return selectedLocations.indexOf(location.properties.location_id) > -1;
            });
            const selectedLocationsData = [
              {
                type: 'FeatureCollection',
                features: filteredLocations,
              },
            ];
            const { transitionListData } = this.state;
            this.goToOriginalPoint = () => {
              setVectorTileLayerForFilteredList(
                selectedLocationsData,
                transitionListData,
                this.view
              );
            };

            setVectorTileLayerForFilteredList(selectedLocationsData, transitionListData, this.view);
            store.dispatch(addList(userList));
            return;
          }
          const { transitionListData } = this.state;

          this.goToOriginalPoint = async () => {
            setVectorTileLayerForFullList(selectedListData, transitionListData, this.view);
          };
          setVectorTileLayerForFullList(selectedListData, transitionListData, this.view);
          store.dispatch(addList(userList));
        }
        if (hashLayersToAdd.length > 0) {
          store.dispatch(toggleLayer(hashLayersToAdd));
        }
      };
      request.onerror = (err) => {
        console.log(`Error: ${err}`);
        store.dispatch(showMapLoader(false));
      };
      request.open('POST', '/map/getUserListLocationData-map', true);
      request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

      request.send(`list_ids=${[listId]}`);
      gtag('event', 'locations add', {
        event_category: 'Map Load',
        event_label: `user added locations from the ${userList.list_name} list`,
      });
    }

    if (selectedTimeframe) {
      if (
        visibleLayers?.includes(gladAlertsID) ||
        visibleLayers?.includes(integratedDeforestationAlertsID)
      ) {
        const startDate = new Date();
        const firstDayOfThisMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        switch (selectedTimeframe) {
          case 'WEEK':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'MONTH':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'QUARTER':
            startDate.setMonth(firstDayOfThisMonth.getMonth() - 3, 1);
            break;
          case 'YEAR':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            break;
        }

        const promise = new Promise((resolve) => {
          startDate.setHours(0, 0, 0, 0);
          resolve();
        });
        promise.then(() => {
          if (selectedTimeframe === 'QUARTER') {
            store.dispatch(analysisActions.setGLADEndDate(firstDayOfThisMonth));
          }
          if (selectedTimeframe === 'MONTH') {
            store.dispatch(analysisActions.setGLADEndDate(new Date()));
          }
          store.dispatch(analysisActions.setGLADStartDate(startDate));
        });
      } else if (visibleLayers?.includes(viirsActiveFiresID)) {
        let fireDays = 1;
        if (selectedTimeframe === 'WEEK') {
          fireDays = 7;
        }

        //make sure we have viirs layer loaded up
        const viirsLayerConfig = this.state.mapLayers.find((lx) => lx.id === viirsActiveFiresID);
        const newViirsLayer = viirsLayer(
          viirsActiveFiresID,
          viirsLayerConfig.url,
          true,
          viirsLayerConfig.order,
          fireDays
        );
        this.view.map.add(newViirsLayer);
        store.dispatch(setFireDays(fireDays));
      }
    }

    if (latitude && longitude && zoom) {
      const point = new Point({
        latitude,
        longitude,
      });

      this.view.goTo({
        target: point,
        scale: zoom - 1,
      });
    }

    if (visibleLayers?.length) {
      hashLayersToAdd.push(...visibleLayers);
    }

    if (hashLayersToAdd.length > 0) {
      hashLayersToAdd.forEach((layer) => {
        store.dispatch(toggleLayer(layer));
      });
      if (gfwListDefinitions && Object.keys(gfwListDefinitions).length > 0) {
        store.dispatch(updateGFWLocations(gfwListDefinitions));
      }
    }
  };

  updateSelectedLists = (list) => {
    store.dispatch(selectList(list));

    this.setState({
      listVectorTileIsAvailable: list?.vector_tiles_storage_path,
      selectedListFromDropdown: true,
      transitionListData: {},
      selectedList: list,
    });

    const { visibleLayers, selectedLists } = this.state;
    const index = selectedLists.findIndex(
      (selectedList) => selectedList.list_name === list.list_name
    );
    const list_ids = selectedLists.map((selectedList) => selectedList.id);

    const mapLayer = getMapLayerIdFromGFWListName(list.list_name);
    // If selected list is a GFW list do this logic
    if (mapLayer) {
      if (index === -1) {
        // We have selected a GFW List
        // need to remove all visible graphics from user list,
        const userLayer = this.view.map.findLayerById('user-locations');
        userLayer.removeAll();

        // check if the corresponding GFW Layer is already visible
        const layerAlreadyVisible = visibleLayers.filter((l) => l === mapLayer)[0];
        if (!layerAlreadyVisible) {
          // if not, turn it on
          store.dispatch(toggleLayer(mapLayer));
        }

        if (layerAlreadyVisible && layerAlreadyVisible === mapLayer) {
          store.dispatch(updateGFWLocations({}));
        }

        // set the selected list to the selected GFW list
        store.dispatch(resetList(list));
      }
      // If selected GFW list IS an active list then unselect it and clear data
      else {
        store.dispatch(removeList(index));
      }
    } else {
      // If active list is a GFW list and selected list is a user list then reset selectedLists and grab data
      if (selectedLists.some((selectedList) => selectedList.isGlobalForestWatchList)) {
        store.dispatch(resetList(list));
        this.getUserLocationData([list.id], list.list_name);
      }
      // If active list is a user list and its Not the currently selected list (only one list at a time!)
      else if (selectedLists.length > 0 && index === -1) {
        store.dispatch(resetList(list));
        this.getUserLocationData([list.id]);
      }
      // If active list is a user list and template id is the same and it's not an existing list then add it to selectedLists and grab data
      else if (index === -1) {
        store.dispatch(addList(list));
        this.getUserLocationData([...list_ids, list.id], list.list_name);
      }
      // If active list is a user list and template id is the same and it's an existing list then remove it from selectedLists and grab data
      else {
        store.dispatch(removeList(index));

        list_ids.splice(index, 1);
        if (list_ids.length === 0) {
          this.view.map.findLayerById('user-locations').removeAll();
        } else {
          this.getUserLocationData(list_ids, list.list_name);
        }
      }
    }

    this._removeCustomGfwVectorTileLayer();
  };

  getUserLocationData = (list_ids, listName) => {
    if (!list_ids?.length) {
      return;
    }
    store.dispatch(showMapLoader(true));
    const request = new XMLHttpRequest();
    request.onload = () => {
      store.dispatch(showMapLoader(false));

      const responseParsed = JSON.parse(request.response);
      if (responseParsed.errorCode && responseParsed.errorCode === 604) {
        this.setState({
          listNotAccessible: true,
        });
        console.log('LIST DATA IS NOT AVAILABLE');
      } else {
        const listData = JSON.parse(request.responseText);
        const { transitionListData } = this.state;
        this.goToOriginalPoint = () => {
          setVectorTileLayerForFullList(listData, transitionListData, this.view);
        };
        setVectorTileLayerForFullList(listData, transitionListData, this.view);
      }
    };
    request.onerror = (err) => {
      store.dispatch(showMapLoader(false));
      console.log(`Error: ${err}`);
    };
    request.open('POST', '/map/getUserListLocationData-map', true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    request.send(`list_ids=${list_ids}`);
    gtag('event', 'locations add', {
      event_category: 'Map Click',
      event_label: `user added locations from the ${listName} list`,
    });
  };

  addCustomBasemaps = (view) => {
    const customBasemaps = [];
    mapPage.basemaps.forEach((basemap) => {
      if (basemap.customUrl) {
        customBasemaps.push(
          new WebTileLayer(basemap.customUrl, {
            visible: false,
            id: basemap.id,
          })
        );
      } else if (basemap.customVectorUrl) {
        if (basemap.id === 'custom-terrain') {
          customBasemaps.push(
            new VectorTileLayer(basemap.customVectorUrl, {
              visible: false,
              id: basemap.id,
            })
          );
        }
      }
    });
    view.map.addMany(customBasemaps);

    const planetBasemapReferenceLayer = new VectorTileLayer({
      id: PLANET_BASEMAP_REFERENCE_LAYER,
      url: PLANET_BASEMAP_REFERENCE_LAYER_VECTOR_TILE_STYLE,
      visible: false,
    });
    view.map.add(planetBasemapReferenceLayer);
  };

  cancelAnalysis = (details) => {
    if (details) {
      this.setState({
        spinnerOn: false,
        dialogOpen: true,
        dialogTitle: details.dialogTitle,
        dialogMessage: details.dialogMessage,
      });
    } else {
      this.setState({ spinnerOn: false });
    }
    store.dispatch(updateAnalysis({}));
    this.view.graphics.removeAll();
  };

  setLossTimeline = (startYear, endYear) => {
    this.setState(
      {
        treeCoverLossDateRange: { startYear: startYear, endYear: endYear },
      },
      () => {
        this.updateActiveAnalysis();
      }
    );
    gtag('event', 'timeslider update', {
      event_category: 'Map Click',
      event_label: 'user updated the tree cover loss timeslider',
    });
  };

  setBiomassTimeline = (startYear, endYear) => {
    this.setState(
      {
        biomassLossDateRange: { startYear, endYear },
      },
      () => {
        this.updateActiveAnalysis();
      }
    );

    gtag('event', 'timeslider update', {
      event_category: 'Map Click',
      event_label: 'user updated the biomass loss timeslider',
    });
  };

  setProdesTimeline = (startYear, endYear) => {
    this.updateProdesVectorTileLayerStyle(startYear, endYear);

    const newState = { startYear, endYear };
    this.setState({ prodesDateRange: newState }, () => {
      this.updateActiveAnalysis();
    });

    gtag('event', 'timeslider update', {
      event_category: 'Map Click',
      event_label: 'user updated the prodes timeslider',
    });
  };

  /**
   * Updates the style of the PRODES deforestation Vector Tile layer
   * @param {number} startYear - Start year of the timeslider
   * @param {number} endYear - End year of the timeslider
   */
  updateProdesVectorTileLayerStyle(startYear, endYear) {
    const prodesVectorTileLayer = this.view.map.findLayerById(prodesDeforestationID);

    let prodesInitialVectorTileStyle;
    if (!this.state.prodesInitialVectorTileStyle) {
      // Set initial Vector Tile Style for PRODES deforestation layer
      prodesInitialVectorTileStyle = prodesVectorTileLayer.currentStyleInfo.style;
      this.setState({ prodesInitialVectorTileStyle: prodesInitialVectorTileStyle });
    } else {
      // Get stored initial Vector Tile Style for PRODES deforestation layer
      prodesInitialVectorTileStyle = this.state.prodesInitialVectorTileStyle;
    }

    const prodesUpdatedVectorTileStyle = getProdesUpdatedVectorTileStyle(
      prodesInitialVectorTileStyle,
      startYear,
      endYear
    );
    prodesVectorTileLayer.loadStyle(prodesUpdatedVectorTileStyle);
  }

  changeBasemap = (id) => {
    mapPage.basemaps.forEach((basemap) => {
      const isCustom = basemap.customUrl || basemap.customVectorUrl;
      const isTarget = basemap.id === id;

      if (isCustom) {
        const bmLayer = this.view.map.findLayerById(basemap.id);
        if (bmLayer) {
          bmLayer.visible = isTarget;
        }
        if (isTarget) {
          this.view.map.basemap = null;
        }
      } else if (isTarget) {
        this.view.map.basemap = id;
      } else if (id === 'custom-default') {
        this.view.map.basemap = getBasemapConfiguration();
      }
    });

    const planetBasemapReferenceLayer = this.view.map.findLayerById(PLANET_BASEMAP_REFERENCE_LAYER);
    if (id === PLANET_BASEMAP) {
      planetBasemapReferenceLayer.visible = true;
      this.view.map.findLayerById('dark-matter').visible = true;
    } else {
      planetBasemapReferenceLayer.visible = false;
    }

    this.forceUpdate();
    gtag('event', 'basemap change', {
      event_category: 'Map Click',
      event_label: `user turned the ${id} basemap on`,
    });
  };

  toggleLayerVisibility = (layerId) => {
    const mapLayer = this.view.map.findLayerById(layerId);
    const previousVisibility = mapLayer.visible;
    gtag('event', 'layer toggle', {
      event_category: 'Map Click',
      event_label: `user turned the ${layerId} layer ${previousVisibility ? 'off' : 'on'}`,
    });
    mapLayer.visible = !mapLayer.visible;
    if (this.customGfwVectorTileLayer && mapLayer.id === this.activeGFWLayer.id) {
      // Hide/show Custom GFW Vector Tile depending on active GFW Layer
      this.customGfwVectorTileLayer.visible = !this.customGfwVectorTileLayer.visible;
    }
    this.view.popup.close();
  };

  shouldCloseDialog = () => {
    this.setState({ dialogOpen: false });
  };

  closePopups = () => {
    if (this.view.popup.features && this.view.popup.features?.length > 0) {
      this.view.popup.features = [];
      this.view.popup.close();
    }
  };

  render() {
    const {
      mapLayers,
      visibleLayers,
      dialogOpen,
      dialogTitle,
      dialogMessage,
      iconLoading,
      visibleLayerInfo,
      visibleBasemapInfo,
      canopyModalVisible,
      treeCoverLossCanopyModalVisible,
      drawShapeNoteDetailsModalVisible,
      panelsVisible,
      searchVisible,
      canopyDensity,
      treeCoverLossCanopyDensity,
      drawingActive,
      gladDateRange,
      biomassRange,
      prodesDateRange,
      analysisResults,
      selectedAnalysis,
      selectedLists,
      analysisWarning,
      fireDays,
      treeCoverLossDateRange,
      adminSelections,
      sketchTool,
      gfwListDef,
      userInfo,
      transitionListData,
      isMapLoading,
      listNotAccessible,
      listVectorTileIsAvailable,
      selectedList,
    } = this.state;

    const { userLists, locationCount, gfwLists, userSharedLists } = this.props;

    return (
      <Page links={pageOptions.links} active="map">
        <ModalLoader position="absolute" size={60} open={isMapLoading} />
        {selectedList && !listVectorTileIsAvailable && !selectedList.isGlobalForestWatchList && (
          <FailedPopupDialog
            open={!listVectorTileIsAvailable}
            title="Map view for your list is still in progress"
            message={
              <p>
                Please check back in 2 hours to view your list on the map. If you are still unable
                to load your list successfully, please contact{' '}
                <a className="popup__link" href="mailto:GFWPROsupport@wri.org">
                  GFWPROsupport@wri.org
                </a>
                .
              </p>
            }
            onOkButtonPress={() =>
              this.setState({ listVectorTileIsAvailable: !listVectorTileIsAvailable })
            }
            onRequestClose={() =>
              this.setState({ listVectorTileIsAvailable: !listVectorTileIsAvailable })
            }
          />
        )}
        <Warning visible={analysisWarning} />
        <CustomDialog
          open={dialogOpen}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          dialogActionConfirm={this.shouldCloseDialog}
        />

        {listNotAccessible && (
          <FailedPopupDialog
            open={listNotAccessible}
            title={`${selectedLists[0].list_name} failed to load.`}
            message={
              <p>
                Please select the list and try again. If list continues to fail, email{' '}
                <a className="popup__link" href="mailto:GFWPROsupport@wri.org">
                  GFWPROsupport@wri.org
                </a>{' '}
                for assistance.
              </p>
            }
            onRequestClose={() => this.setState({ listNotAccessible: !listNotAccessible })}
            onOkButtonPress={() => (window.location = '/map')}
          />
        )}

        <div className="map-subnav-container">
          <div className="map-subnav">
            <ListSection
              userLists={userLists}
              locationCount={locationCount}
              gfwLists={gfwLists}
              selectedLists={selectedList}
              transitionListData={transitionListData}
              view={this.view}
              selectedListCallback={this.updateSelectedLists}
              userSharedLists={userSharedLists}
              listContext={'map'}
              currentUser={this.props.userInfo}
            />
          </div>
        </div>

        <ControlPanel
          mapView={this.view}
          panelsVisible={panelsVisible}
          zoomOut={this.zoomOut}
          zoomIn={this.zoomIn}
        />

        <AdhocAnalysis visibleLayers={visibleLayers} dateSliderDateRange={gladDateRange} />

        <ProdesControls
          loaded={this.view && this.view.ready}
          visible={visibleLayers.indexOf(prodesDeforestationID) > -1}
          setProdesTimeline={this.setProdesTimeline}
        />

        <BiomassControls
          loaded={this.view && this.view.ready}
          visible={visibleLayers.indexOf(treeBiomassLossID) > -1}
          setBiomassTimeline={this.setBiomassTimeline}
        />

        <LossControls
          loaded={this.view && this.view.ready}
          visible={
            visibleLayers.includes(treeCoverLossID) ||
            visibleLayers.includes(argentineanNativeForestsLoss)
          }
          setLossTimeline={this.setLossTimeline}
        />

        <FiresControls
          fireDays={this.state.fireDays}
          visible={visibleLayers.indexOf(viirsActiveFiresID) > -1}
        />

        <div
          className={`layer-modal-container modal-wrapper ${
            visibleLayerInfo.title ? '' : 'hidden'
          }`}
        >
          <LayerModal title={visibleLayerInfo.title} info={visibleLayerInfo} />
        </div>
        <div className={`layer-modal-container modal-wrapper ${searchVisible ? '' : 'hidden'}`}>
          <SearchModal
            mapView={this.view}
            loaded={this.view && this.view.ready && !!mapLayers.length}
            mapLayers={mapLayers}
          />
        </div>
        <div
          className={`layer-modal-container modal-wrapper ${
            visibleLayerInfo.custom ? '' : 'hidden'
          }`}
        >
          <InfoModal info={visibleLayerInfo} />
        </div>
        <div
          className={`layer-modal-container modal-wrapper ${visibleBasemapInfo ? '' : 'hidden'}`}
        >
          <BasemapModal content={visibleBasemapInfo} />
        </div>
        {treeCoverLossCanopyModalVisible && (
          <div className="layer-modal-container modal-wrapper">
            <CanopyModal
              id="tree-cover-loss"
              sliderValue={treeCoverLossCanopyDensity}
              onSliderChange={(value) => store.dispatch(updateTreeCoverLossCanopyDensity(value))}
              onClose={() => store.dispatch(toggleTreeCoverLossCanopyModal())}
            />
          </div>
        )}
        {canopyModalVisible && (
          <div className="layer-modal-container modal-wrapper">
            <CanopyModal
              id="tree-cover"
              sliderValue={canopyDensity}
              onSliderChange={(value) => store.dispatch(updateCanopyDensity(value))}
              onClose={() => store.dispatch(toggleCanopyModal())}
            />
          </div>
        )}
        <div
          className={`layer-modal-container modal-wrapper ${
            drawShapeNoteDetailsModalVisible ? '' : 'hidden'
          }`}
        >
          <DrawShapeNoteDetailsModal
            onClose={() => store.dispatch(toggleDrawShapeNoteDetailsModal())}
          />
        </div>

        <LayerPanel mapLayers={mapLayers} visibleLayers={visibleLayers} iconLoading={iconLoading} />

        <AnalysisPanel
          adminArea={this.state.adminArea}
          activeAnalysis={this.state.activeAnalysis}
          adminSelections={adminSelections}
          panelsVisible={panelsVisible}
          cancelAnalysis={this.cancelAnalysis}
          spinnerOn={this.state.spinnerOn}
          setDialogInfo={this.setDialogInfo}
          analysisResults={analysisResults}
          setGeometry={this.setGeometry}
          analyzeAdmin={this.analyzeAdmin}
          locationsAfterState={this.locationsAfterState}
          info={visibleLayerInfo}
          changeBasemap={this.changeBasemap}
          drawingActive={drawingActive}
          mapLayers={mapLayers}
          selectedAnalysis={selectedAnalysis}
          visibleLayers={visibleLayers}
          analysisWarning={analysisWarning}
          gladDateRange={gladDateRange}
          biomassRange={biomassRange}
          prodesDateRange={prodesDateRange}
          fireDays={fireDays}
          treeCoverLossDateRange={treeCoverLossDateRange}
          canopyDensity={canopyDensity}
          treeCoverLossCanopyDensity={treeCoverLossCanopyDensity}
          sketchTool={sketchTool}
          setLocationName={this.setLocationName}
          userInfo={userInfo}
          landsatYear={this.state.landsatYear}
          selectedList={selectedLists}
          isMapCentered={this.state.isMapCentered}
          goToOriginalPoint={() => {
            this.setState({ isMapCentered: true });
            this.goToOriginalPoint();
          }}
          closePopups={this.closePopups}
          isMapMoving={this.state.isMapMoving}
        />

        <Legend
          panelsVisible={panelsVisible}
          canopyDensity={canopyDensity}
          treeCoverLossCanopyDensity={treeCoverLossCanopyDensity}
          iconLoading={iconLoading}
          mapLayers={mapLayers}
          gfwListDef={gfwListDef}
          visibleLayers={visibleLayers}
          biomassRange={biomassRange}
          toggleLayerVisibility={this.toggleLayerVisibility}
          selectedLists={selectedLists}
        />

        <div style={containerStyle} className="map-container">
          <div style={mapStyle} ref="mapView" />
        </div>
      </Page>
    );
  }
}

export default withRouter(Map);
