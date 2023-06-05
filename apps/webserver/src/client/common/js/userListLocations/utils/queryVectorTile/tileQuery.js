import { bbox, circle, booleanWithin } from '@turf/turf';
import { vt2geojson } from './vt2geojson';
import { getXYZ } from './xyz-affair';

function createTileURLS(xyz, tiles) {
  return xyz.reduce((index, item) => {
    const url = tiles.replace('{x}', item.x).replace('{y}', item.y).replace('{z}', item.z);
    return [...index, url];
  }, []);
}

async function getFeaturesFromTile(tileURLS, layerName) {
  const geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  for (let i = 0; i < tileURLS.length; i++) {
    const uri = tileURLS[i];
    try {
      const tileFeaturesCollection = await vt2geojson({ uri, layer: layerName });
      geojson.features = tileFeaturesCollection.features;
    } catch (e) {
      new Error(`Error getting features ${e}`);
    }
  }

  return geojson;
}

const setConfig = (config, userConfig) => {
  for (let i in userConfig) {
    config[i] = userConfig[i];
  }
  return userConfig;
};

async function tileQuery(options) {
  let config = {
    point: [-82.54, 39.11],
    radius: 1,
    units: 'miles',
    tiles: 'https://tilequery.netlify.app/tiles/test/{z}/{x}/{y}.mvt',
    layer: 'test',
    zoom: 14,
    buffer: false,
    pointInPolygon: false,
    logger: false,
  };

  config = setConfig(config, options);

  if (config.logger) {
    console.log(config);
  }

  if (
    !config ||
    !config.point ||
    !config.radius ||
    !config.units ||
    !config.tiles ||
    !config.layer ||
    config.zoom === null ||
    config.zoom === undefined
  ) {
    throw new Error('missing required config parameters');
  }

  const bufferedPoint = circle(config.point, config.radius, {
    units: config.units,
    steps: 500,
  });

  const bounds = bbox(bufferedPoint);
  const xyz = getXYZ(
    [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ],
    config.zoom
  );

  const tileURLS = createTileURLS(xyz, config.tiles);
  if (config.logger) {
    console.log('Tile URL: ', tileURLS);
  }

  const geojson = await getFeaturesFromTile(tileURLS, config.layer);

  if (config.logger) {
    const timer = Date.now();
    console.log('total features found: ', geojson.features.length);
    console.log('query execution time (seconds): ', (Date.now() - timer) / 1000);
  }

  if (config.buffer) {
    const within = {
      type: 'FeatureCollection',
      features: [],
    };

    for (let i = 0; i < geojson.features.length; i++) {
      if (booleanWithin(geojson.features[i], bufferedPoint)) {
        within.features.push(geojson.features[i]);
      }
    }

    if (config.logger) {
      console.log('features returned within buffer: ', within.features.length);
    }

    return within;
  }

  if (config.pointInPolygon) {
    const polygon = {
      type: 'FeatureCollection',
      features: [],
    };

    const pointFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: config.point,
      },
    };

    for (let i = 0; i < geojson.features.length; i++) {
      if (booleanWithin(pointFeature, geojson.features[i])) {
        polygon.features.push(geojson.features[i]);
      }
    }

    if (config.logger) {
      console.log('polygon features found:', polygon.features.length);
    }

    return polygon;
  }

  return geojson;
}

export default tileQuery;
