import React from 'react';
import { render } from 'react-dom';
import _uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import { scaleLinear } from 'd3-scale';
import Graphic from 'esri/Graphic';
import Point from 'esri/geometry/Point';
import FeatureLayer from 'esri/layers/FeatureLayer';

import {
  incrementZoomLevel,
  saveView,
  selectAdmin,
  setZoomLevelTotal,
} from '../actions/dashboardActions';
import store from '../store';

import dictionary from './dictionary';
import { prettifyNum } from '../../../common/js/utils/diagnostics.utils';
import {
  checkForAlerts,
  checkForNoAlerts,
  getNumberOfAlerts,
  getTimeframeProperty,
  TIMEFRAME_RANGE,
} from './dashboard-date.utils';

function initializeMap(view) {
  // Save view to redux - can be used in other react components if needed
  store.dispatch(saveView(view));
  // Disable certain navigation as detailed in requirements
  view.on('double-click', (evt) => {
    evt.stopPropagation();
  });
  view.on('double-click', ['Control'], (evt) => {
    evt.stopPropagation();
  });
  view.on('mouse-wheel', (evt) => {
    evt.stopPropagation();
  });
  view.on('click', (evt) => {
    view.hitTest(evt).then((response) => {
      const state = store.getState();
      const { zoomLevel } = state;
      const { results } = response;
      const dashboardGraphic = results.find((layer) =>
        layer.graphic.attributes.hasOwnProperty('numberOfAlerts')
      );

      if (dashboardGraphic.graphic.attributes.numberOfLocations > 0 && zoomLevel < 3) {
        const selectedAdmin = dashboardGraphic.graphic.attributes[`gadmid_${zoomLevel}`];
        const locationsWithAlert = getAlertsTotal(selectedAdmin, zoomLevel);
        store.dispatch(setZoomLevelTotal(locationsWithAlert));
        store.dispatch(selectAdmin(selectedAdmin));
        store.dispatch(incrementZoomLevel());
        gtag('event', 'Dashboard Map zoom in clicked', {
          event_category: 'Dashboard Click',
          event_label:
            'User click on a circle on the Dashboard to zoom the map in to the next level',
        });
      }
      view.popup.close();
    });
  });

  view.on('pointer-move', (evt) => {
    // Perform hit text at the screenpoint
    view.hitTest({ x: evt.x, y: evt.y }).then((response) => {
      const { results } = response;
      const dashboardGraphic = results.find((layer) =>
        layer.graphic.attributes.hasOwnProperty('numberOfAlerts')
      );
      if (dashboardGraphic) {
        handleFeatureHover(view, dashboardGraphic);
      } else {
        view.popup.close();
      }
    });
  });
}

/**
 * Handling map feature hover
 * @param {Object} view
 * @param {Object} graphic
 */
function handleFeatureHover(view, graphic) {
  view.popup.viewModel.includeDefaultActions = false; // remove 'Zoom To' icon
  view.popup.open({
    location: graphic.mapPoint,
    content: createPopup(graphic.graphic),
  });
}

function returnNameBasedOnZoom(zoomLevel, attributes) {
  let locationName = '';
  if (zoomLevel === 0) {
    locationName = attributes.Country;
  } else if (zoomLevel === 1) {
    locationName = attributes.State;
  } else if (zoomLevel === 2) {
    locationName = attributes.SubState;
  } else {
    locationName = attributes.location_name;
  }
  return locationName;
}

/**
 * Create popup template
 * @param {Object} graphic - Graphic object
 * @returns {HTMLElement}
 */
function createPopup(graphic) {
  const state = store.getState();
  const { attributes } = graphic;
  const { zoomLevel, rawData } = state;

  const content = (
    <div className="popup__content">
      <table>
        <tbody>
          <tr>
            <td>Number of Alerts</td>
            <td>{prettifyNum(attributes.numberOfAlerts)}</td>
          </tr>
          <tr>
            <td>Number of Locations</td>
            <td>{attributes.numberOfLocations}</td>
          </tr>
          {zoomLevel < 3 ? (
            <tr>
              <td>Administrative Region</td>
              <td>{returnNameBasedOnZoom(zoomLevel, attributes)}</td>
            </tr>
          ) : (
            <tr>
              <td>Location Name</td>
              <td>{returnNameBasedOnZoom(zoomLevel, attributes)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  const node = document.createElement('div');
  render(content, node);
  return node;
}

function handleBaseLayer(map, zoomLevel) {
  const selectedSublayer = dictionary.zoomLevel_basemapLayerId[zoomLevel];
  map.basemap.baseLayers.items[0].sublayers.items.forEach((sublayer) => {
    sublayer.visible = sublayer.id === selectedSublayer;
  });
}

function getCentroidGeometries(gadmids, zoomLevel, data) {
  const lat_long__mapping = {
    0: {
      lat: 'gadmid_0_lat',
      long: 'gadmid_0_lon',
    },
    1: {
      lat: 'gadmid_1_lat',
      long: 'gadmid_1_lon',
    },
    2: {
      lat: 'gadmid_2_lat',
      long: 'gadmid_2_lon',
    },
    3: {
      lat: 'location_lat',
      long: 'location_lon',
    },
  };

  return new Promise((resolve, reject) => {
    const features = Object.values(data)
      .flat()
      .map((f) => {
        return {
          attributes: f.properties,
          geometry: new Point({
            latitude: f.properties[lat_long__mapping[zoomLevel].lat],
            longitude: f.properties[lat_long__mapping[zoomLevel].long],
          }),
        };
      });
    resolve(features);
  });
}

function mergeData(
  featuresArray,
  data,
  zoomLevel,
  selectedAlert,
  rawData,
  locationFilters,
  selectedTimeframe
) {
  const { zoomLevelTotal } = store.getState();

  const { ALERTS, NOALERTS } = locationFilters;
  const selectedCoverageProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
  const selectedAdminProperty = dictionary.zoomLevel_gadmidGroupBy[zoomLevel];
  const timeframeProperty = getTimeframeProperty(selectedAlert, selectedTimeframe);

  // --WIP TODO rewrite, this needs major refactoring, right now we check for alert type and then the time fram
  // and we apply different filters based on different timeframes, we need solution that is re-usable and less verbose
  const filteredFeatures = featuresArray.map((feature) => {
    // 1. calculate number of locations within a given admin unit
    // data is and object that has features grouped by admin unit depending on zoom level it can be IDN.[1].[15] (e.g "IDN": [...features], "LKA": [...features])
    const activeAdminId = feature.attributes[selectedAdminProperty];
    const adminUnitData = data[feature.attributes[selectedAdminProperty]];
    const hasDataForAlert = adminUnitData.some(
      (f) => f.properties[selectedCoverageProperty] === true
    );

    const numberOfLocations = rawData.geojson.features.reduce((acc, val) => {
      if (val.properties[selectedAdminProperty] === activeAdminId) {
        if (!ALERTS && !NOALERTS) {
          return acc + 1;
        }
        if (ALERTS && NOALERTS) {
          return val.properties[selectedCoverageProperty] ? acc + 1 : acc;
        }
        if (ALERTS && !NOALERTS) {
          // With Alerts
          const timeFrameCheck = checkForAlerts(val, selectedTimeframe, timeframeProperty);

          return val.properties[selectedCoverageProperty] && timeFrameCheck ? acc + 1 : acc;
        }
        if (!ALERTS && NOALERTS) {
          // With NO Alerts
          const timeFrameCheck = checkForNoAlerts(val, selectedTimeframe, timeframeProperty);

          return val.properties[selectedCoverageProperty] && timeFrameCheck ? acc + 1 : acc;
        }
      } else {
        return acc;
      }
    }, 0);

    // 2. calculate number of alerts within a given admin unit
    const numberOfAlerts = getNumberOfAlerts(adminUnitData, selectedTimeframe, timeframeProperty);

    const percentageOfLocations = zoomLevelTotal ? (numberOfLocations / zoomLevelTotal) * 100 : 100;
    let treeCoverArea = adminUnitData.reduce(
      (totalTree, f) => totalTree + Number(f.properties.umd),
      0
    );

    treeCoverArea = treeCoverArea === 0 ? numberOfAlerts : treeCoverArea;
    const treeDensity = numberOfAlerts / treeCoverArea;

    return {
      ...feature,
      attributes: {
        ...feature.attributes,
        hasAlerts: hasDataForAlert,
        numberOfLocations,
        percentageOfLocations,
        numberOfAlerts,
        treeCoverArea,
        treeDensity,
      },
    };
  });

  return filteredFeatures;
}

function summarizeFeatures(featuresArray, selectedAlert, selectedTimeframe) {
  const timeframeAttributeField = getTimeframeProperty(selectedAlert, selectedTimeframe);

  const summarizedFeaturesArray = featuresArray.map((feature) => {
    const selectedTimeframeValues = feature.attributes[timeframeAttributeField];
    const numberOfAlerts = selectedTimeframeValues.reduce((total, curent) => {
      return TIMEFRAME_RANGE[selectedTimeframe].includes(curent.day) ? total + curent.count : total;
    }, 0);

    let treeCoverArea = Number(feature.attributes.umd);
    treeCoverArea = treeCoverArea === 0 ? numberOfAlerts : treeCoverArea;
    const treeDensity = numberOfAlerts / treeCoverArea;

    const numberOfLocations = 1;
    const selectedCoverageProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
    const totalLocations = featuresArray.length;
    const hasAlerts = feature.attributes[selectedCoverageProperty];
    const percentageOfLocations = totalLocations ? (numberOfLocations / totalLocations) * 100 : 100;

    feature.attributes = {
      ...feature.attributes,
      percentageOfLocations,
      numberOfAlerts,
      numberOfLocations,
      treeCoverArea,
      treeDensity,
      hasAlerts,
    }

    return feature;
  });

  return summarizedFeaturesArray;
}

/**
 * Get Symbol size
 * @param {number} percentageOfLocations - Percentage of Locations
 * @returns {number} - Size of Symbol
 */
function getSymbolSize(percentageOfLocations) {
  if (percentageOfLocations > 75) {
    return 50;
  }
  if (percentageOfLocations > 50) {
    return 40;
  }
  if (percentageOfLocations > 25) {
    return 30;
  }
  return 20;
}

/**
 * Get symbol color
 * @param {Object} feature - Feature object
 * @param {number} maxDensity - Features Density Max value
 * @returns {string} - Color RGBA value
 */
function getSymbolColor(feature, maxDensity) {
  const { treeDensity, hasAlerts } = feature.attributes;
  const orange = 'rgba(255, 165, 0, 0.75)';
  const green = 'rgba(0, 128, 0, 0.75)';
  const gray = 'rgba(153, 153, 153, 0.75)';

  // Determine color
  if (hasAlerts) {
    if (isNaN(treeDensity)) {
      return green;
    }
    if (!isFinite(treeDensity)) {
      return orange;
    }
    // Create scale
    const scale = scaleLinear().domain([0, maxDensity]).range([green, orange]);
    return scale(treeDensity);
  }
  return gray;
}

/**
 * Get Alerts Total for selected sets of features
 *
 * @returns {number} - Number of Alerts
 * @param {string} selectedAdmin - Dashboard Map selected Admin
 * @param {number} zoomLevel - Dashboard Map Zoom level
 * @return {number} - Number of Alerts
 */
function getAlertsTotal(selectedAdmin = '', zoomLevel = -1) {
  const { rawData } = store.getState();
  let totalLocations;

  if (zoomLevel >= 0 && selectedAdmin.length > 0) {
    totalLocations = rawData.geojson.features.filter((feature) => {
      return feature.properties[`gadmid_${zoomLevel}`] === selectedAdmin;
    });
  } else {
    totalLocations = rawData.geojson.features;
  }

  return totalLocations.length;
}

function findMaxTreeDensity(features) {
  const densityArray = features
    .map((feature) => feature.attributes.treeDensity)
    .filter((density) => !isNaN(density));
  const maxTreeDensity = Math.max(...densityArray);
  return (maxTreeDensity && maxTreeDensity !== -Infinity) ? maxTreeDensity : 1;
}

/**
 * Create graphics for feature
 * @param {Array} features - List of features
 * @returns {Array} - List of graphics
 */
function createGraphics(features) {
  const maxTreeDensity = findMaxTreeDensity(features);

  return features.map((feature) => {
    return new Graphic({
      attributes: {
        ...feature.attributes,
        SubState: feature.attributes['Sub State'],
        treeDensity: feature.attributes.hasAlerts ? feature.attributes.treeDensity : -1,
        maxTreeDensity,
      },
      geometry: feature.geometry,
    });
  });
}

/**
 * Create and return graphics layer based on graphics passed in function
 * @param graphics
 */
function createLayer(graphics, maxDensity) {
  const zeroToTwentyFive = {
    type: 'simple-marker',
    size: '20px',
    outline: {
      width: 0,
      color: [0, 0, 0, 0],
    },
  };

  const TwentyFiveToFifty = {
    type: 'simple-marker',
    size: '40px',
    outline: {
      width: 0,
      color: [0, 0, 0, 0],
    },
  };

  const FiftyToSeventyFive = {
    type: 'simple-marker',
    size: '60px',
    outline: {
      width: 0,
      color: [0, 0, 0, 0],
    },
  };

  const SeventyFiveToOneHundred = {
    type: 'simple-marker',
    size: '80px',
    outline: {
      width: 0,
      color: [0, 0, 0, 0],
    },
  }

  return new FeatureLayer({
    id: 'DASHBOARDLAYER',
    fields: [
      {
        name: 'ObjectID',
        alias: 'ObjectID',
        type: 'oid',
      },
      {
        name: 'type',
        alias: 'Type',
        type: 'string',
      },
      {
        name: 'numberOfAlerts',
        alias: 'numberOfAlerts',
        type: 'integer',
      },
      {
        name: 'treeDensity',
        alias: 'treeDensity',
        type: 'double',
      },
      {
        name: 'maxTreeDensity',
        alias: 'maxTreeDensity',
        type: 'double'
      },
      {
        name: 'numberOfLocations',
        alias: 'numberOfLocations',
        type: 'integer',
      },
      {
        name: 'percentageOfLocations',
        alias: 'percentageOfLocations',
        type: 'double'
      },
      {
        name: 'gadmid_0',
        alias: 'gadmid_0',
        type: 'string',
      },
      {
        name: 'gadmid_1',
        alias: 'gadmid_1',
        type: 'string',
      },
      {
        name: 'gadmid_2',
        alias: 'gadmid_2',
        type: 'string',
      },
      {
        name: 'Country',
        alias: 'Country',
        type: 'string',
      },
      {
        name: 'State',
        alias: 'State',
        type: 'string',
      },
      {
        name: 'SubState',
        alias: 'SubState',
        type: 'string',
      },
      {
        name: 'location_name',
        alias: 'location_name',
        type: 'string',
      },
    ],
    outFields: ['*'],
    objectIdField: 'ObjectID',
    geometryType: 'point',
    spatialReference: { wkid: 4326 },
    source: graphics,
    renderer: {
      type: 'class-breaks',
      field: 'percentageOfLocations',
      defaultSymbol: {
        type: "simple-marker", // autocasts as new SimpleFillSymbol()
        color: "#999999",
        outline: {
          width: 0,
          color: [0, 0, 0, 0],
        }
      },
      classBreakInfos: [
        {
          minValue: 0,
          maxValue: 25,
          symbol: zeroToTwentyFive,
        },
        {
          minValue: 25.09,
          maxValue: 50,
          symbol: TwentyFiveToFifty,
        },
        {
          minValue: 50.09,
          maxValue: 75,
          symbol: FiftyToSeventyFive,
        },
        {
          minValue: 75.09,
          maxValue: 100,
          symbol: SeventyFiveToOneHundred,
        },
      ],
      visualVariables: [
        {
          type: "color", // indicates this is a color visual variable
          field: "treeDensity",
          normalizationField: 'maxTreeDensity',
          stops: [
            {
              value: -1.0,
              opacity: '0.75',
              color: "#999999",
            },
            {
              value: 0.0, // features where < 1% of tree density
              opacity: '0.75',
              color: "#008000", // will be assigned this color (green)
            },
            {
              value: 1.0, // features where 100% tree density
              opacity: '0.75',
              color: "#FFA500", // will be assigned this color (orange)
            }
          ],
          // features with values between 0.01 - 1.0 will be assigned
          // a color on a ramp between green and orange proportional
          // to where the value falls between 0.001 and 1.0
        },
      ],
    },
  });
}

function updateLayer(
  map,
  view,
  data,
  selectedAlert,
  selectedTimeframe,
  locationFilters,
  zoomLevel,
  rawData
) {
  const clonedData = data;
  // If no features, delete the key/value
  if (zoomLevel < 3) {
    Object.entries(clonedData).forEach((prop) => {
      const [key, value] = prop;
      if (!value.length) {
        delete clonedData[key];
      }
    });
  }

  const oldLayer = map.findLayerById('DASHBOARDLAYER');
  if (isEmpty(clonedData)) {
    if (oldLayer) {
      map.remove(oldLayer);
    }
  } else {
    const processedGADMIds = Object.keys(clonedData);
    getCentroidGeometries(processedGADMIds, zoomLevel, clonedData)
      .then((featuresArray) => {
        // depending on the zoom level we either merge data? or summarize features?
        let features;
        if (zoomLevel < 3) {
          features = mergeData(
            featuresArray,
            clonedData,
            zoomLevel,
            selectedAlert,
            rawData,
            locationFilters,
            selectedTimeframe
          );
        } else {
          features = summarizeFeatures(featuresArray, selectedAlert, selectedTimeframe);
        }

        if (oldLayer) {
          map.remove(oldLayer);
        }

        handleBaseLayer(map, zoomLevel);

        const graphics = createGraphics(features);
        const layer = createLayer(graphics);
        map.add(layer);

        layer.when(function () {
          view
            .goTo(graphics, {
              animate: true,
              duration: 300,
              easing: 'ease-in',
            })
            .then(() => {
              if (graphics.length > 1) {
                view.extent = view.extent.expand(1.5);

                if ([0, 1].includes(zoomLevel)) {
                  const selectedAdminProperty = dictionary.zoomLevel_gadmidGroupBy[zoomLevel];
                  const uniqAdmins = _uniq(
                    graphics.map((graphic) => graphic.attributes[selectedAdminProperty])
                  );
                  if (uniqAdmins.length === 1) {
                    view.scale = dictionary.zoomLevel_scale[zoomLevel];
                  }
                }
              } else {
                view.scale = dictionary.zoomLevel_scale[zoomLevel];
              }
            });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

/**
 * Get Graphics Layer JSON object
 * @returns {*}
 */
function getLayerGraphicsJSON() {
  const state = store.getState();
  const { map } = state;
  const layer = map.findLayerById('DASHBOARDLAYER');
  if (layer) {
    const graphics = layer.source.items;
    return graphics.map((graphic) => graphic.toJSON());
  }
  return [];
}

function getExtent() {
  const { latitude, longitude } = view.center;
  return { latitude, longitude };
}

function getMapExtent() {
  return view.extent;
}

module.exports = {
  initializeMap,
  getAlertsTotal,
  updateLayer,
  getLayerGraphicsJSON,
  getExtent,
  getMapExtent,
};
