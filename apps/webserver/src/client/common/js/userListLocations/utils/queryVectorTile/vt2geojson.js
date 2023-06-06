import PBF from 'pbf';
import MapboxVT from '@mapbox/vector-tile';

export const vt2geojson = async (args) => {
  return new Promise((resolve, reject) => {
    if (!args.uri) {
      new Error('No URI found. Please provide a valid URI to your vector tile.');
    }

    // handle zxy stuffs
    if (args.x === undefined || args.y === undefined || args.z === undefined) {
      const zxy = args.uri.match(/\/(\d+)\/(\d+)\/(\d+)/);
      if (!(!zxy || zxy.length < 4)) {
        args.z = zxy[1];
        args.x = zxy[2];
        args.y = zxy[3];
      } else {
        new Error(`Could not determine tile z, x, and y from ${args.uri}.`);
      }
    }

    const parsed = new URL(args.uri);
    if (parsed.protocol && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
      fetch(args.uri)
        .then((res) => {
          if (res.status === 401) {
            new Error('Invalid Token');
          }

          if (res.status !== 200) {
            new Error(`Error retrieving data from. Server responded with code: ${args.uri}`);
          }

          return res.arrayBuffer();
        })
        .then(async (tileArrayBuffer) => {
          const tileFeatureCollection = await getVectorTileFeatureCollection(
            args,
            tileArrayBuffer
          ).catch((err) => {
            new Error(`Could not get get VectorTile Feature Collection: ${args.uri} - ${err}.`);
          });
          resolve(tileFeatureCollection);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
};

/**
 *
 * @param {Object} args - Tile arguments ({x, y, z, layer, url})
 * @param {ArrayBuffer} tileArrayBuffer - Tile ArrayBuffer data
 * @return {Promise<{features: *[], type: string}>}
 */
async function getVectorTileFeatureCollection(args, tileArrayBuffer) {
  const tile = new MapboxVT.VectorTile(new PBF(tileArrayBuffer));
  let layers = args.layer || Object.keys(tile.layers);

  if (!Array.isArray(layers)) {
    layers = [layers];
  }

  const tileFeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  layers.forEach((layerID) => {
    const layer = tile.layers[layerID];
    if (layer) {
      for (let i = 0; i < layer.length; i++) {
        try {
          const feature = layer.feature(i).toGeoJSON(args.x, args.y, args.z);
          if (layers.length > 1) {
            feature.properties.vt_layer = layerID;
          }

          tileFeatureCollection.features.push(feature);
        } catch (err) {
          console.log(err);
        }
      }
    }
  });

  return tileFeatureCollection;
}
