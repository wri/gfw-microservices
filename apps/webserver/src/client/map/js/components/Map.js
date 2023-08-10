import React, { Component } from 'react';
import moment from 'moment';
import Dialog from 'material-ui/Dialog';
import _isEmpty from 'lodash/isEmpty';

// ESRI Imports
import EsriMap from '@arcgis/core/Map';
import Extent from '@arcgis/core/geometry/Extent';
import * as GeometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import Point from '@arcgis/core/geometry/Point';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import esriConfig from '@arcgis/core/config';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';

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
  updateAdminSelections,
  updateAnalysis,
  updateGFWLocations,
} from '../actions/mapActions';
import * as analysisActions from '../actions/analysisActions';

import {
  DATA_API_URL,
  locationsPage,
  mapPage,
  proLayers,
  supportedGeostoreAnalysis,
  vectorEnabledLayers,
} from '../../../common/js/config';
import {
  centroidHighlightSymb,
  centroidSymbol,
  fillSymbolDefault,
  fillSymbolHighlight,
} from '../../../common/js/map.config';
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import { registerGeometry } from '../../../common/js/utils/gfwAPI';
import GfwButton from '../../../common/js/components/GfwButton';
import Page from '../../../common/js/components/Page';
import ListSection from '../../../common/js/components/listPanel/ListSection';
import ModalLoader from '../../../common/js/components/Loaders/ModalLoader';

// Utils
import utils from '../utils/AppUtils';
import layerInfoCache from '../utils/layerInfoCache';
import { layerFactory } from '../utils/LayerFactory';
import { identifyPoints, queryAdmin, queryExtent } from '../utils/LayerUtils';
import { getBBoxAndGeostoreIDs, getVectorTileStyle } from '../utils/gfw-api.utils';
import setVectorTileLayerForFilteredList from '../utils/setVectorTileLayerForFilteredList';
import setVectorTileLayerForFullList from '../utils/setVectorTileLayerForFullList';
import { getLocationGeometry } from '../utils/map.utils';
import { constructLayerObject } from '../../../common/js/utils/layer.utils';
import { getGfwProMapLayerName, isGfwList } from '../../../common/js/utils/gfw.utils';

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
import CanopyModal from './modals/CanopyModal';
import InfoModal from './modals/InfoModal';
import LayerModal from './modals/LayerModal';
import SearchModal from './modals/SearchModal';

import { GFWLists } from '../../../locations/js/config/listNames';
import { selectList } from '../../../locations/js/actions/locationActions';
import { gfwListsLocationID } from '../../../locations/js/components/lists/Lists.config';
import { FailedPopupDialog } from '../../../locations/js/components/landing/FailedPopupDialog';

import FormaLayer from '../layers/FormaLayer';
import viirsLayer, { fetchViirsFeatures } from '../layers/VIIRSLayerUtil';
import { getProdesUpdatedVectorTileStyle } from '../layers/Prodes_LayerUtil';

// Configs
import {
  PLANET_BASEMAP,
  PLANET_BASEMAP_REFERENCE_LAYER,
  PLANET_BASEMAP_REFERENCE_LAYER_VECTOR_TILE_STYLE,
  USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID,
} from '../config/map.config';

// Services
import { fetchGfwProLayers } from '../service/gfw.service';

// Style
import '../../css/map.scss';

// import all layer names that we will be using directly
const {
  adminAreas,
  administrativeAreas,
  brazilBiomesID,
  formaAlertsID,
  gladAlertsID,
  raddAlertsID,
  raddCoverageID,
  oilPalmConcessions,
  prodesDeforestationID,
  protectedAreas,
  rspoConcessions,
  rspoPalmOilMills,
  soyOnTreeCoverLoss,
  treeBiomassLossID,
  treeCoverID,
  treeCoverLossID,
  treePlantationsSpecies,
  universalMillList,
  userLocations,
  viirsActiveFiresID,
  soyPlantedArea,
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

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.mapView;

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
    });

    this.svm = null;
  }

  componentWillUnmount() {
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

    this.setEsriDefaults();

    const esriMap = new EsriMap();

    const { listData } = this.props;

    const { x, y, z } = listData;

    esriMap.add(
      new VectorTileLayer(mapPage.basemaps[0].customVectorUrl, {
        id: mapPage.basemaps[0].id,
      })
    );

    const mapView = new MapView({
      container: this.refs.mapView,
      center: x && y ? [x, y] : [0, 16.53],
      zoom: z ? z - 1 : 3,
      map: esriMap,
      ui: {
        components: ['attribution'],
      },
      constraints: {
        minZoom: 2,
      },
    });
    this.mapView = mapView;

    mapView.when(this.mapLoaded);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      visibleLayers,
      canopyDensity,
      gladConfirmed,
      modalLayerInfo,
      activeAnalysis,
      adminArea,
      gfwListDef,
      landsatYear,
      soyYear,
      planetTileLayer,
      planetTileColor,
    } = this.state;

    const { listData } = this.props;
    const { gfwListName } = listData;

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
          const configLayer = mapPage.layers.find((layer) => layer.id === nowVisibleLayer);
          if (mapLayer) {
            if (configLayer.propsToWatch) {
              this.setLayerWatching(configLayer, mapLayer);
            }
            this.view.map.add(mapLayer);
            mapLayer.visible = true;
            this.sortMapArray(mapLayer);
          } else if (nowVisibleLayer === formaAlertsID) {
            this.getFormaLayer(this.state.mapLayers).then((formaLayer) => {
              this.getFormaLayerCallback(configLayer, formaLayer);
            });
          }
        }

        if (mapPage.exclusiveLayers.includes(nowVisibleLayer)) {
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

        if (mapPage.exclusiveLayers.includes(nowHiddenLayer)) {
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
          const configLayer = mapPage.layers.find((layer) => layer.id === nowVisibleLayer);
          if (mapLayer) {
            if (configLayer.propsToWatch) {
              this.setLayerWatching(configLayer, mapLayer);
            }
            this.view.map.add(mapLayer);
            mapLayer.visible = true;
            this.sortMapArray(mapLayer);
          } else if (nowVisibleLayer === formaAlertsID) {
            this.getFormaLayer(this.state.mapLayers).then((formaLayer) => {
              this.getFormaLayerCallback(configLayer, formaLayer);
            });
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
          const [mapLayerConfig] = mapPage.layers.filter(
            (mapLayer) => mapLayer.id === visibleLayer
          );
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
              const configLayer = mapPage.layers.find((layer) => layer.id === visibleLayer);
              if (nowVisibleLayer) {
                if (configLayer.propsToWatch) {
                  this.setLayerWatching(configLayer, nowVisibleLayer);
                }
                this.view.map.add(nowVisibleLayer);
                nowVisibleLayer.visible = true;
                gtag('event', 'layer toggle', {
                  event_category: 'Map Click',
                  event_label: `user turned the ${nowVisibleLayer.id} layer on`,
                });
              } else if (visibleLayer === formaAlertsID) {
                this.getFormaLayer(this.state.mapLayers).then((formaLayer) => {
                  this.getFormaLayerCallback(configLayer, formaLayer);
                });
              }
            }
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

          const nowHiddenIds = prevState.visibleLayers.filter(
            (layer) => visibleLayers.indexOf(layer) === -1
          );
          if (nowHiddenIds.length > 0) {
            nowHiddenIds.forEach((nowHiddenId) => {
              const nowHiddenLayer = this.view.map.findLayerById(nowHiddenId);
              if (nowHiddenLayer) {
                nowHiddenLayer.visible = false;
                //Check if automatically hidden layer was radd alert layer and if so, hide coverage as well as those two layers go hand in hand
                if (nowHiddenId === raddAlertsID) {
                  const raddCoverageLayer = this.view.map.findLayerById(raddCoverageID);
                  if (raddCoverageLayer) {
                    raddCoverageLayer.visible = false;
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

      if (activeGFWLayer.sublayers) {
        const defExpression = '1=1';
        activeGFWLayer.sublayers.items.forEach((sublayer) => {
          sublayer.definitionExpression = defExpression;
        });
      } else {
        this._removeCustomGfwVectorTileLayer();
      }
    } else if (Object.keys(prevState.gfwListDef).length < Object.keys(gfwListDef).length) {
      // Adding GFW list layer to Sidebar panel

      const locationDefaultID = gfwListName
        ? gfwListsLocationID[gfwListName].arcgis_field
        : 'globalid';
      const activeLayerId = Object.keys(gfwListDef)[0];
      const activeGFWLayer = this.view.map.findLayerById(activeLayerId);
      this.activeGFWLayer = activeGFWLayer;
      const locationsIDs = gfwListDef[activeLayerId];

      if (activeGFWLayer.sublayers) {
        const defExpression =
          activeLayerId === oilPalmConcessions || activeLayerId === universalMillList
            ? locationDefaultID + ' IN (' + locationsIDs.map((id) => "'" + id + "'") + ')'
            : locationDefaultID + ' IN (' + locationsIDs.map((id) => "'{" + id + "}'") + ')';

        let url;
        activeGFWLayer.sublayers.items.forEach((sublayer) => {
          url = sublayer.url;
          sublayer.definitionExpression = defExpression;
        });

        queryExtent(url, defExpression).then((extent) => {
          this.view.goTo(extent);
        });
      } else {
        // Active GFW Layer "activeGFWLayer" is Tile Layer. No sublayers on selected layer
        // In that case we need to add Custom Vector Tile Layer

        activeGFWLayer.when((gfwLayer) => {
          this._setCustomGfwVectorTileLayer(locationsIDs, gfwListName, gfwLayer);
        });
      }
    }

    if (
      prevState.visibleLayers !== visibleLayers &&
      (this.view.graphics.items.length > 0 ||
        drawnGraphic.length > 0 ||
        activeAnalysis === 'region')
    ) {
      const disablePolygon = !visibleLayers.some(
        (visibleLayer) => mapPage.exclusiveDrawLayers.indexOf(visibleLayer) !== -1
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
      const densityLayers = mapPage.layers.filter(
        (layer) => layer && layer.propsToWatch && layer.propsToWatch.indexOf('threshold') > -1
      );
      densityLayers.forEach((densityLayer) => {
        const mapLayer = this.view.map.findLayerById(densityLayer.id);
        if (mapLayer) {
          const duplicate = mapLayer;
          if (mapLayer.id === soyOnTreeCoverLoss) {
            duplicate.renderingRule.functionName = 'soy' + (this.state.canopyDensity + 1);
            const promise = new Promise((resolve) => {
              this.view.map.remove(mapLayer);
              resolve();
            });
            promise.then(() => {
              this.view.map.add(duplicate);
            });
          } else {
            duplicate.threshold = canopyDensity;

            //this is to force-trigger a re-add of this layer which will make new tile requests w/ the new density
            const handler = this.view.map.allLayers.on('change', (evt) => {
              handler.remove(); // this ensures that we only do this once
              if (evt.removed.length > 0) {
                if (evt.removed[0].id === duplicate.id) {
                  const promise = new Promise((resolve) => {
                    resolve();
                  });
                  promise.then(() => {
                    // Adding 'tree-cover' layer always before 'tree-cover-loss' if 'tree-cover-loss' is present
                    let treeCoverLossIndex;
                    const [treeCoverLoss] = this.view.map.layers.items.filter((item, index) => {
                      if (item.id === treeCoverLossID) {
                        treeCoverLossIndex = index;
                        return true;
                      }
                      return false;
                    });
                    if (treeCoverLoss && duplicate.id === treeCoverID) {
                      this.view.map.add(duplicate, treeCoverLossIndex);
                    } else {
                      this.view.map.add(duplicate);
                    }
                  });
                }
              }
            });

            this.view.map.remove(mapLayer);
          }
        }
      });
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

    if (prevState.gladConfirmed !== gladConfirmed) {
      const mapLayer = this.view.map.findLayerById(gladAlertsID);
      if (mapLayer) {
        const duplicate = mapLayer;

        // `confirmed` value updates Glad Layer to `Show only high confidence alerts` on map
        duplicate.confirmed = gladConfirmed;
        const promise = new Promise((resolve) => {
          this.view.map.remove(mapLayer);
          resolve();
        });
        promise.then(() => {
          this.view.map.add(duplicate);
        });
      }

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

    const { gladDateRange, formaDateRange, raddDateRange, biomassRange } = this.state;
    if (prevState.gladDateRange !== gladDateRange) {
      if (
        prevState.gladDateRange.start !== gladDateRange.start ||
        prevState.gladDateRange.end !== gladDateRange.end
      ) {
        const mapLayer = this.view.map.findLayerById(gladAlertsID);

        // `julianTo` and `julianFrom` are used in GladLayer.js to filter the data in image provided by - tiles.globalforestwatch.org
        const julianTo = parseInt(gladDateRange.end.getJulian(), 10);
        const julianFrom = parseInt(gladDateRange.start.getJulian(), 10);
        mapLayer.julianTo = julianTo;
        mapLayer.julianFrom = julianFrom;
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
    }

    if (
      prevState.biomassRange.min !== biomassRange.min ||
      prevState.biomassRange.max !== biomassRange.max
    ) {
      const mapLayer = this.view.map.findLayerById(treeBiomassLossID);
      if (mapLayer) {
        mapLayer.minRange = biomassRange.min;
        mapLayer.maxRange = biomassRange.max;
      }

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

    if (prevState.formaDateRange !== formaDateRange) {
      if (
        prevState.formaDateRange.start !== formaDateRange.start ||
        prevState.formaDateRange.end !== formaDateRange.end
      ) {
        const mapLayer = this.view.map.findLayerById(formaAlertsID);
        mapLayer.startDate = formaDateRange.start;
        mapLayer.endDate = formaDateRange.end;

        mapLayer.julianTo = formaDateRange.end.getJulian();
        mapLayer.julianFrom = formaDateRange.start.getJulian();
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
    }

    if (prevState.raddDateRange !== raddDateRange) {
      if (
        prevState.raddDateRange.start !== raddDateRange.start ||
        prevState.raddDateRange.end !== raddDateRange.end
      ) {
        const mapLayer = this.view.map.findLayerById(raddAlertsID);
        mapLayer.startDate = raddDateRange.start;
        mapLayer.endDate = raddDateRange.end;

        mapLayer.julianTo = raddDateRange.end.getJulian();
        mapLayer.julianFrom = raddDateRange.start.getJulian();
        //TODO: enable this when we have RADD OTF is available
        // if (activeAnalysis === 'draw' && this.view.graphics.items.length > 0) {
        //   this.analyzeCustom(this.view.graphics.items[0]);
        // } else if (
        //   activeAnalysis === 'region' &&
        //   Object.keys(adminArea).length !== 0 &&
        //   adminArea.constructor === Object
        // ) {
        //   this.analyzeAdmin(adminArea);
        // }
      }
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
  }

  sortMapArray = (mapLayer) => {
    const mapLayerConfigIndex = mapPage.layers.findIndex(
      (configLayer) => configLayer.id === mapLayer.id
    );
    this.view.map.layers.items.some((layer, index) => {
      const configLayerIndex = mapPage.layers.findIndex(
        (configLayer) => configLayer.id === layer.id
      );
      // this layer exists in the layer config
      if (configLayerIndex > -1) {
        // get order number for current layer
        const configOrder = mapPage.layers[configLayerIndex].order;
        // get order number for layer to add
        const configOrderToAdd = mapPage.layers[mapLayerConfigIndex].order;

        // THING ABOUT LAYERS:
        // Start of layer array is rendered at the BOTTOM.
        // End of layer array is rendered at the TOP.

        if (configOrder < configOrderToAdd) {
          this.view.map.layers.reorder(mapLayer, index);
          return true;
        } else if (index === this.view.map.layers.items.length - 1) {
          this.view.map.add(mapLayer);
          return true;
        }
      } else if (index === this.view.map.layers.items.length - 1) {
        // if you get to the end of the array without adding layer yet then add it at the end
        this.view.map.add(mapLayer);
        return true;
      }
    });
  };

  setEsriDefaults = () => {
    mapPage.corsEnabledServers.forEach((corsEnabledServer) => {
      esriConfig.request.corsEnabledServers.push(corsEnabledServer);
    });

    esriConfig.request.interceptors.push({
      urls: [locationsPage.add.protectedAreasUrl, locationsPage.add.protectedServicesUrl],
      before: (params) => {
        console.log(params);
        params.requestOptions.query.token = locationsPage.add.protectedAreas[location.hostname];
      },
    });

    // esriRequest.setRequestPreCallback((ioArgs) => {
    //   if (ioArgs.url.search(locationsPage.add.protectedAreasUrl) > -1) {
    //     if (!ioArgs.content) {
    //       ioArgs.content = {
    //         f: 'json'
    //       };
    //     }
    //     ioArgs.content.token = locationsPage.add.protectedAreas[location.hostname];
    //   } else if (ioArgs.url.search(locationsPage.add.protectedServicesUrl) > -1) {
    //     if (!ioArgs.content) {
    //       ioArgs.content = {
    //         f: 'json'
    //       };
    //     }
    //     ioArgs.content.token = locationsPage.add.protectedAreas[location.hostname];
    //   }
    //   return ioArgs;
    // });
  };

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
          mapPage.exclusiveLayers.includes(l)
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
      if (!this.svm || this.svm.state === 'ready') {
        return;
      }

      event.stopPropagation();
      this.svm.complete();
    });

    this.setState(sketchEventListener);
  };

  initializeSketchViewModel = (view) => {
    const svm = new SketchViewModel({
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
    this.svm = svm;

    svm.on('create', (event) => {
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
        store.dispatch(toggleDrawing());
        this.analyzeCustom(graphic);
      }
    });
    store.dispatch(saveSketchTool(svm));
  };

  executeIdentifyTask = (evt) => {
    const allLayers = this.view.map.layers.items.filter((l) => !vectorEnabledLayers.includes(l.id));
    const deferreds = [];

    allLayers.forEach((layer) => {
      if (layer.visible) {
        const layerConfig = utils.getObject(mapPage.layers, 'id', layer.id);
        if (layerConfig && layerConfig.popupTemplate) {
          deferreds.push(identifyPoints(layer, evt, this.view));
        }
      }
    });
    Promise.all(deferreds).then((response) => {
      const popFeats = [];
      response.forEach((layer) => {
        layer?.response?.results?.forEach((result) => {
          const popupTemplate = utils.getObject(mapPage.layers, 'id', layer.layer).popupTemplate;
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
        const vectorLayerPopupInfo = mapPage.layers.find((l) => l.id === layerID);
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

  legacyAnalysisCall = (microserviceUrl, geojson) => {
    currentAnalysisCall = new XMLHttpRequest();
    currentAnalysisCall.onload = () => {
      this.setState({ spinnerOn: false });
      if (currentAnalysisCall) {
        store.dispatch(updateAnalysis(JSON.parse(currentAnalysisCall.response)));
      }
      currentAnalysisCall = '';
    };

    currentAnalysisCall.onerror = (err) => {
      console.log('Request Error:', err);
      const details = {
        dialogTitle: 'Analysis Failure',
        dialogMessage: 'The analysis call on this custom feature failed.',
      };
      this.cancelAnalysis(details);
    };

    currentAnalysisCall.open('POST', microserviceUrl);
    currentAnalysisCall.setRequestHeader('Content-Type', 'application/json');
    currentAnalysisCall.send(JSON.stringify({ geojson: geojson }));
  };

  geostoreAnalysisCall = async (totalAreaHa, type, geostoreID, origin = 'rw') => {
    const baseTCLURL = `https://data-api.globalforestwatch.org/analysis/zonal/${geostoreID}`;
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

    //For certain layers we want to use geostore analysis approach, we still able to use the old enpoints for those datasets
    //that are not following the new standard
    if (supportedGeostoreAnalysis.includes(microservice.type)) {
      this.geostoreAnalysisCall(
        geostoreResponse.data.attributes.areaHa,
        microservice.type,
        geostoreID,
        origin
      );
    } else {
      this.legacyAnalysisCall(microservice.microservice, geojson);
    }
  };

  setLocationName = (name) => {
    this.setState({ locationName: name });
  };

  goToLocations = () => {
    const { esriJson, locationName, globalIds, activeGFWList, selectedMapFeatureAttributes } =
      this.state;
    this.setState({ spinnerOn: true });
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

    const request = new XMLHttpRequest();
    request.open('POST', '/locations/map-locations', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(requestObject));
    request.onload = () => {
      if (request.response === 'submitted') {
        window.location = '/locations';
      }
    };
    request.onerror = (err) => {
      this.setState({ spinnerOn: false });
      console.log(err);
    };
  };

  getCurrentAnalysis = (type) => {
    let analysisType = 'tree cover';
    // const threshold = this.state.canopyDensity; //TODO: Add other layer-specific query params!
    const { canopyDensity, fireDays, formaDateRange, prodesDateRange } = this.state;

    let microservice;
    if (this.state.visibleLayers.includes(prodesDeforestationID)) {
      microservice = `https://production-api.globalforestwatch.org/v1/prodes-loss?period=${prodesDateRange.startYear}-01-01%2C${prodesDateRange.endYear}-12-31&thresh=${canopyDensity}`;
      analysisType = 'prodes';
    } else if (this.state.visibleLayers.includes(treeBiomassLossID)) {
      analysisType = 'tree biomass';
    } else if (this.state.visibleLayers.includes(gladAlertsID)) {
      analysisType = 'glad';
    } else if (this.state.visibleLayers.includes(formaAlertsID)) {
      microservice = `https://production-api.globalforestwatch.org/v1/forma250GFW?period=${formaDateRange.start.getFullYear()}-${(
        '0' +
        (formaDateRange.start.getMonth() + 1)
      ).slice(-2)}-${formaDateRange.start.getDate()}%2C${formaDateRange.end.getFullYear()}-${(
        '0' +
        (formaDateRange.end.getMonth() + 1)
      ).slice(-2)}-${formaDateRange.end.getDate()}&thresh=${canopyDensity}`;
      analysisType = 'forma';
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
    const { visibleLayers, landsatYear } = this.state;

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
        const currentForestChange = visibleLayers.some((layer) =>
          mapPage.exclusiveLayers.includes(layer)
        );
        this.view.popup.actions.forEach((action) => {
          if (selectedFeat.layerName === viirsActiveFiresID) {
            action.visible = false;
          } else {
            action.visible =
              (action.id === 'ANALYZE' && currentForestChange) ||
              (action.id === 'ADD LOCATION' &&
                mapPage.noLocationLayers.indexOf(selectedFeat.layerName) === -1);
          }
        });
      }
    });

    this.view.watch('zoom', (newZoom) => {
      const mapLayer = this.view.map.findLayerById('landsat');
      if (mapLayer) {
        if (newZoom >= 12 && mapLayer.urlTemplate.indexOf('.png') === -1) {
          mapLayer.urlTemplate = `https://production-api.globalforestwatch.org/v2/landsat-tiles/${landsatYear}/{level}/{col}/{row}.png`;
        } else if (newZoom < 12 && mapLayer.urlTemplate.indexOf('.png') > -1) {
          mapLayer.urlTemplate = `https://production-api.globalforestwatch.org/v2/landsat-tiles/${landsatYear}/{level}/{col}/{row}`;
        }
      }
    });

    layersToAdd = layerFactory(
      layers.filter((layer) => layer && layer.type !== 'carto'),
      view
    );

    const initialLayers = layersToAdd
      .filter(
        (layer) => mapPage.visibleLayers.indexOf(layer.id) > -1 || layer.id === raddCoverageID
      )
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
    this._setCustomGfwVectorTileLayer = async (locationIDs, gfwListName, gfwLayer) => {
      let gfwVectorTileUrl = gfwLayer.url;
      const regExpDomainName = /^.*\/\/[^\/]+/;
      const gfwVectorTileStyle = gfwLayer.styleRepository;
      const vectorTileUrlChunks = gfwVectorTileUrl.replace(regExpDomainName, '').split('/');
      const GFW_LIST = vectorTileUrlChunks[1];
      let date = vectorTileUrlChunks[2];
      let QUERY_FIELD = 'gfw_geostore_id';

      if (gfwListName === 'Palm Oil Mills') {
        QUERY_FIELD = 'uml_id';
      }

      if (gfwListName === 'Protected Areas') {
        // Processing - Palm Oil Mills points

        // TODO: Currently latest date is not in sync. Check if this needs to be updated and remove at some point in future
        const PROTECTED_AREAS_DATE = 'v202106';
        gfwVectorTileUrl = gfwVectorTileUrl.replace(date, PROTECTED_AREAS_DATE);
        date = PROTECTED_AREAS_DATE;
      }

      // Create Custom GFW Vector Tile Layer
      this.customGfwVectorTileLayer = new VectorTileLayer({
        id: `${gfwLayer.id} - Custom`,
        style: await getVectorTileStyle(
          GFW_LIST,
          QUERY_FIELD,
          locationIDs,
          gfwVectorTileUrl,
          gfwVectorTileStyle
        ),
      });
      view.map.add(this.customGfwVectorTileLayer);
      gfwLayer.opacity = 0;

      try {
        if (locationIDs.length < 200) {
          // Zoom to locations only if we have less than 200 locations
          const { data } = await getBBoxAndGeostoreIDs(GFW_LIST, QUERY_FIELD, locationIDs, date);
          if (data && data.data.length !== 0 && data.status === 200) {
            const locations = data.data;

            // Zoom to locations
            const extents = locations.map((item) => {
              return new Extent(...item.gfw_bbox);
            });
            this.mapView.goTo(extents);
          } else {
            console.log('Zooming to GFW List locations failed.');
          }
        }
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

  setLayerWatching = (configLayer, mapLayer) => {
    configLayer.propsToWatch.forEach((prop) => {
      mapLayer.watch(prop, (propValue) => {
        const duplicate = mapLayer;
        duplicate[prop] = propValue;
        const promise = new Promise((resolve) => {
          this.view.map.remove(mapLayer);
          resolve();
        });
        promise.then(() => {
          this.view.map.add(duplicate);
        });
      });
      if (prop === 'threshold') {
        mapLayer.threshold = this.state.canopyDensity;
      }
    });
  };

  applyStateFromUrl = () => {
    const { listData, gfwLists } = this.props;
    const {
      l,
      i,
      filteredLists,
      path,
      filterCount,
      numLocations,
      name,
      dashboard_map_extent,
      gfwlist,
      g,
      showFullListMap,
      totalNumberOfLocationsInList,
    } = listData;

    const gfwListDefinitions = {};
    const hashLayersToAdd = [];

    if (numLocations) {
      // only set this if we are coming from the map or diagnostics
      // if we set it always, we will see 'undefined' in the banner
      this.setState({
        transitionListData: {
          id: i,
          numLocations: showFullListMap ? totalNumberOfLocationsInList : numLocations,
          name,
          filterCount,
          path,
          dashboard_map_extent,
        },
      });
    }
    if (l) {
      hashLayersToAdd.push(...l);
    }

    if (g) {
      const gfwLocations = filteredLists;
      if (g === administrativeAreas) {
        if (gfwLocations.length > 0) {
          queryAdmin(gfwLocations[0]).then((adminArea) => {
            store.dispatch(analysisActions.setAnalysis('analysis'));
            store.dispatch(analysisActions.setActiveAnalysis('region'));
            store.dispatch(
              analysisActions.setAnalysisAdminArea({
                country: adminArea.country,
                region: adminArea.region,
              })
            );
            this.view.goTo(adminArea);
            this.analyzeAdmin(adminArea);

            store.dispatch(
              updateAdminSelections({
                country: adminArea.countryText,
                smallerRegion: adminArea.stateText,
                subregion: adminArea.substateText,
              })
            );
          });
        }
      } else {
        if (gfwLocations && gfwLocations.length > 0) {
          gfwListDefinitions[g] = [];
          gfwLocations.forEach((gfwLocation) => {
            gfwListDefinitions[g].push(gfwLocation);
          });
        } else {
          const [listToSelect] = gfwLists.filter((gfwList) => gfwList.list_name === name);
          if (listToSelect) {
            this.updateSelectedLists(listToSelect);
          }
        }
        hashLayersToAdd.push(g); //gfwList from Lists
      }
    } else if (i && !gfwlist) {
      const { userLists, userSharedLists } = this.props;
      const combinedUserLists = [...userLists, ...userSharedLists];
      store.dispatch(showMapLoader(true));
      const list_ids = [i];
      const userList = combinedUserLists.find((list) => list.id === list_ids[0]);

      const request = new XMLHttpRequest();
      request.onload = () => {
        store.dispatch(showMapLoader(false));
        if (request.responseText === '') {
          console.log('LIST DATA IS NOT AVAILABLE');
        } else {
          const selectedListData = JSON.parse(request.responseText);

          if (!showFullListMap && filteredLists) {
            if (filteredLists && filteredLists.length > 0) {
              const feats = selectedListData[0].features;

              const filteredLocations = feats.filter((location) => {
                return filteredLists.indexOf(location.properties.location_id) > -1;
              });
              const selectedLocationsData = [
                {
                  type: 'FeatureCollection',
                  features: filteredLocations,
                },
              ];
              const { transitionListData } = this.state;
              setVectorTileLayerForFilteredList(
                selectedLocationsData,
                transitionListData,
                this.view
              );
              store.dispatch(addList(userList));
              return;
            }
          }
          const { transitionListData } = this.state;
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

      request.send(`list_ids=${list_ids}`);
      gtag('event', 'locations add', {
        event_category: 'Map Load',
        event_label: `user added locations from the ${userList.list_name} list`,
      });
    } else if (i && gfwlist) {
      const id = GFWLists[i - 1];
      let mapLayer;

      switch (id) {
        case 'Oil Palm Concessions':
          mapLayer = oilPalmConcessions;
          break;
        case 'Palm Oil Mills':
          mapLayer = universalMillList;
          break;
        case 'Protected Areas':
          mapLayer = protectedAreas;
          break;
        case 'RSPO Palm Concessions':
          mapLayer = rspoConcessions;
          break;
        default:
      }

      if (mapLayer) {
        const { lat, lng, z } = listData;
        const pt = new Point({
          latitude: lat,
          longitude: lng,
        });

        this.view
          .goTo({
            target: pt,
            scale: z - 1,
          })
          .then(() => {
            store.dispatch(toggleLayer(mapLayer));
          });
      }
    }

    const { t } = listData; //a: locationFilters.ALERTS

    if (t) {
      if (l && l === gladAlertsID) {
        const startDate = new Date();
        const firstDayOfThisMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        switch (t) {
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
          if (t === 'QUARTER') {
            store.dispatch(analysisActions.setGLADEndDate(firstDayOfThisMonth));
          }
          store.dispatch(analysisActions.setGLADStartDate(startDate));
        });
      } else if (l && l === viirsActiveFiresID) {
        let fireDays = 1;
        if (t === 'WEEK') {
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

    if (hashLayersToAdd.length > 0) {
      //TODO: Could we do this twice?! why are the 'hashLayersToAdd' getting checked and toggled twice?
      store.dispatch(toggleLayer(hashLayersToAdd));
      if (
        gfwListDefinitions &&
        Object.keys(gfwListDefinitions).length > 0 &&
        gfwListDefinitions[g].length > 0
      ) {
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
    const GFWindex = GFWLists.indexOf(list.list_name);

    // If selected list is a GFW list do this logic
    if (GFWindex !== -1) {
      const id = GFWLists[GFWindex];
      const mapLayer = getGfwProMapLayerName(id);

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

        // zoom to the layer's extent
        if (mapLayer === protectedAreas) {
          this.view.goTo({
            target: [15, 27],
            zoom: 2,
          });
        } else {
          const activeGFWLayer = this.state.mapLayers.filter((l) => l.id === mapLayer)[0];
          const url = `${activeGFWLayer.url}/${activeGFWLayer.layerId}`;

          queryExtent(url).then((extent) => {
            this.view.goTo(extent);
          });
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
      if (selectedLists.some((v) => GFWLists.indexOf(v) >= 0)) {
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

  getFormaLayer = (layers) => {
    return new Promise((resolve) => {
      const formaLayer = layers.filter((layer) => layer && layer.type === 'forma')[0];

      const request = new XMLHttpRequest();
      request.onload = () => {
        const jsonData = JSON.parse(request.responseText);
        resolve(
          new FormaLayer({
            id: formaLayer.id,
            visible: false,
            urlTemplate: jsonData.url,
            date: jsonData.date,
          })
        );
      };
      request.onerror = (err) => {
        console.log('Request Error:', err);
        resolve(false);
      };

      request.open('GET', formaLayer.url, true);
      request.send();
    });
  };

  getFormaLayerCallback = (configLayer, formaLayer) => {
    this.view.map.add(formaLayer);
    formaLayer.visible = true;
    gtag('event', 'layer toggle', {
      event_category: 'Map Click',
      event_label: `user turned the ${formaLayer.id} layer on`,
    });
    this.setLayerWatching(configLayer, formaLayer);
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
    console.log('currentAnalysisCall', currentAnalysisCall); //TODO: is .abort a function??;
    currentAnalysisCall.abort();
    this.view.graphics.removeAll();
  };

  setLossTimeline = (startYear, endYear) => {
    const { activeAnalysis, adminArea } = this.state;
    const treeCoverLoss = this.view.map.findLayerById(treeCoverLossID);

    const duplicate = treeCoverLoss;
    duplicate.minYear = startYear;
    duplicate.maxYear = endYear;

    // this is to force-trigger a re-add of this layer which will make new tile requests w/ the new density
    const handler = this.view.map.allLayers.on('change', (evt) => {
      handler.remove(); // this ensures we only do this once
      if (evt.removed.length > 0) {
        if (evt.removed[0].id === duplicate.id) {
          const promise = new Promise((resolve) => {
            resolve();
          });
          promise.then(() => {
            this.view.map.add(duplicate);
          });
        }
      }
    });

    this.view.map.remove(treeCoverLoss);

    this.setState(
      {
        treeCoverLossDateRange: { startYear: startYear, endYear: endYear },
      },
      () => {
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
    );
    gtag('event', 'timeslider update', {
      event_category: 'Map Click',
      event_label: 'user updated the tree cover loss timeslider',
    });
  };

  setBiomassTimeline = (startYear, endYear) => {
    const { activeAnalysis, adminArea } = this.state;
    const biomassLoss = this.view.map.findLayerById(treeBiomassLossID);
    biomassLoss.minYear = startYear;
    biomassLoss.maxYear = endYear;
    biomassLoss.refresh();
    this.setState(
      {
        biomassLossDateRange: { startYear: startYear, endYear: endYear },
      },
      () => {
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
    );
    gtag('event', 'timeslider update', {
      event_category: 'Map Click',
      event_label: 'user updated the biomass loss timeslider',
    });
  };

  setProdesTimeline = (startYear, endYear) => {
    const { activeAnalysis, adminArea } = this.state;
    this.updateProdesVectorTileLayerStyle(startYear, endYear);

    const newState = { startYear, endYear };
    this.setState({ prodesDateRange: newState }, () => {
      if (activeAnalysis === 'draw' && this.view.graphics.items.length > 0) {
        this.analyzeCustom(this.view.graphics.items[0]);
      } else if (
        activeAnalysis === 'region' &&
        Object.keys(adminArea).length !== 0 &&
        adminArea.constructor === Object
      ) {
        this.analyzeAdmin(adminArea);
      }
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
      if (basemap.customUrl || basemap.customVectorUrl) {
        const bmLayer = this.view.map.findLayerById(basemap.id);
        if (basemap.id === id) {
          bmLayer.visible = true;
          this.view.map.basemap = '';
        } else {
          bmLayer.visible = false;
        }
      } else if (basemap.id === id) {
        this.view.map.basemap = id;
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

  handleStartDate = (evt, date) => {
    const { visibleLayers } = this.state;
    if (visibleLayers.indexOf(gladAlertsID) > -1) {
      store.dispatch(analysisActions.setGLADStartDate(date));
    }
    if (visibleLayers.indexOf(formaAlertsID) > -1) {
      store.dispatch(analysisActions.setFORMAStartDate(date));
    }
    if (visibleLayers.indexOf(raddAlertsID) > -1) {
      store.dispatch(analysisActions.setRADDStartDate(date));
    }
  };

  handleSliderDate = (evt, date) => {
    const { visibleLayers } = this.state;
    if (visibleLayers.indexOf(gladAlertsID) > -1) {
      store.dispatch(analysisActions.setGLADSliderDate(date));
    }
    if (visibleLayers.indexOf(formaAlertsID) > -1) {
      store.dispatch(analysisActions.setFORMASliderDate(date));
    }
    if (visibleLayers.indexOf(raddAlertsID) > -1) {
      store.dispatch(analysisActions.setRADDSliderDate(date));
    }
  };

  handleEndDate = (evt, date) => {
    const { visibleLayers } = this.state;
    if (visibleLayers.indexOf(gladAlertsID) > -1) {
      store.dispatch(analysisActions.setGLADEndDate(date));
    }
    if (visibleLayers.indexOf(formaAlertsID) > -1) {
      store.dispatch(analysisActions.setFORMAEndDate(date));
    }
    if (visibleLayers.indexOf(raddAlertsID) > -1) {
      store.dispatch(analysisActions.setRADDEndDate(date));
    }
  };

  render() {
    const defaultAction = [
      <GfwButton
        classNames="AnalysisPanel__dialog-button btn-green"
        value="OK"
        onClick={this.shouldCloseDialog}
      />,
    ];
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
      drawShapeNoteDetailsModalVisible,
      panelsVisible,
      searchVisible,
      canopyDensity,
      drawingActive,
      gladDateRange,
      formaDateRange,
      raddDateRange,
      biomassRange,
      prodesDateRange,
      analysisResults,
      selectedAnalysis,
      selectedLists,
      analysisWarning,
      gladConfirmed,
      fireDays,
      treeCoverLossDateRange,
      adminSelections,
      sketchTool,
      gfwListDef,
      userInfo,
      selectedListFromDropdown,
      transitionListData,
      isMapLoading,
      listNotAccessible,
      listVectorTileIsAvailable,
      selectedList,
    } = this.state;

    const { userLists, locationCount, gfwLists, listData, userSharedLists } = this.props;

    let dateSliderDateRange = {};
    let dateSliderTitle = '';
    if (visibleLayers.indexOf(gladAlertsID) > -1) {
      dateSliderDateRange = gladDateRange;
      dateSliderTitle = 'GLAD';
    }
    if (visibleLayers.indexOf(raddAlertsID) > -1) {
      dateSliderDateRange = raddDateRange;
      dateSliderTitle = 'RADD';
    }
    if (visibleLayers.indexOf(formaAlertsID) > -1) {
      dateSliderDateRange = formaDateRange;
      dateSliderTitle = 'FORMA';
    }

    return (
      <Page links={pageOptions.links} active="map">
        <ModalLoader position="absolute" size={60} open={isMapLoading} />
        {selectedList && !listVectorTileIsAvailable && !isGfwList(selectedList.list_name) && (
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
        <Dialog
          paperClassName="dialog-paper"
          open={dialogOpen}
          title={dialogTitle}
          actions={defaultAction}
          onRequestClose={this.shouldCloseDialog}
        >
          {dialogMessage}
        </Dialog>

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
              listData={selectedListFromDropdown ? null : listData}
              transitionListData={!selectedListFromDropdown ? transitionListData : {}}
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

        <AdhocAnalysis
          visible={
            visibleLayers.indexOf(gladAlertsID) > -1 ||
            visibleLayers.indexOf(formaAlertsID) > -1 ||
            visibleLayers.indexOf(raddAlertsID) > -1
          }
          start={dateSliderDateRange.start}
          sliderDate={dateSliderDateRange.sliderDate}
          end={dateSliderDateRange.end}
          changeStart={this.handleStartDate}
          changeSlider={this.handleSliderDate}
          changeEnd={this.handleEndDate}
          title={dateSliderTitle}
        />

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
          visible={visibleLayers.indexOf(treeCoverLossID) > -1}
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
        <div
          className={`layer-modal-container modal-wrapper ${canopyModalVisible ? '' : 'hidden'}`}
        >
          <CanopyModal content={canopyDensity} />
        </div>
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
          formaDateRange={formaDateRange}
          raddDateRange={raddDateRange}
          biomassRange={biomassRange}
          prodesDateRange={prodesDateRange}
          fireDays={fireDays}
          treeCoverLossDateRange={treeCoverLossDateRange}
          canopyDensity={canopyDensity}
          sketchTool={sketchTool}
          setLocationName={this.setLocationName}
          userInfo={userInfo}
          landsatYear={this.state.landsatYear}
        />
        <Legend
          panelsVisible={panelsVisible}
          canopyDensity={canopyDensity}
          iconLoading={iconLoading}
          mapLayers={mapLayers}
          gfwListDef={gfwListDef}
          visibleLayers={visibleLayers}
          gladConfirmed={gladConfirmed}
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
