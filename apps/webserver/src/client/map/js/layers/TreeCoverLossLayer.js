import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import esriRequest from '@arcgis/core/request';
import { latestTreeCoverLossYearForTclDataInMap } from '../../../common/js/config';

// Power function to determine intensity
const getScalePowFunc = (exp) => {
  const domain = [0, 256];
  const range = [0, 256];
  const b = range[0] - domain[0];
  const m = (range[1] - b) / Math.pow(domain[1], exp);

  return (x) => {
    return Math.pow(x, exp) * m + b;
  };
};

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

const populateIntensityBank = (baseRGB = [220, 0, 185]) => {
  const [baseValue1, baseValue2, baseValue3] = baseRGB;
  const intensityBank = {};
  for (let z = 1; z < 21; z++) {
    intensityBank[z] = [];
    const exp = z < 11 ? 0.3 + (z - 3) / 20 : 1;
    const lMoney = getScalePowFunc(exp);
    for (let f = 0; f < 256; f++) {
      intensityBank[z][f] = [];
      intensityBank[z][f].push(clamp(baseValue1));
      intensityBank[z][f].push(clamp(baseValue2 - z - (3 * lMoney(f)) / z));
      intensityBank[z][f].push(clamp(baseValue3 - z - lMoney(f) / z));
      intensityBank[z][f].push(clamp(z < 13 ? lMoney(f) : f));
    }
  }
  return intensityBank;
};

const TreeCoverLossLayer = BaseTileLayer.createSubclass({
  properties: {
    baseRGB: [100, 100, 100],
    threshold: 30,
    minYear: 2001,
    maxYear: latestTreeCoverLossYearForTclDataInMap,
  },

  initialize: function () {
    this.intensityBank = populateIntensityBank(this?.properties?.baseRGB);
  },

  getTileUrl: function (level, row, column) {
    return this.urlTemplate
      .replace('{z}', level)
      .replace('{x}', column)
      .replace('{y}', row)
      .replace('{thresh}', this.threshold);
  },

  fetchTile: function (level, row, column) {
    // call getTileUrl() method to construct the URL to tiles
    // for a given level, row and col provided by the LayerView
    const url = this.getTileUrl(level, row, column);
    // request for tiles based on the generated url
    // set allowImageDataAccess to true to allow
    // cross-domain access to create WebGL textures for 3D.
    return esriRequest(url, {
      responseType: 'image',
      allowImageDataAccess: true,
    }).then(
      function (response) {
        // We use a promise because we can't return an empty canvas before the image data has loaded, been filtered, and properly colored
        const promise = new Promise((resolve) => {
          // when esri request resolves successfully
          // get the image from the response
          const image = response.data;
          const width = this.tileInfo.size[0];
          const height = this.tileInfo.size[0];
          // create a canvas with 2D rendering context
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;
          // Draw the blended image onto the canvas.
          context.drawImage(image, 0, 0, width, height);
          const imageObject = new Image();
          imageObject.crossOrigin = 'Anonymous';
          imageObject.onload = () => {
            context.drawImage(imageObject, 0, 0, width, height);
            const imageData = context.getImageData(0, 0, width, height);
            imageData.data.set(this.filter(imageData.data));
            context.putImageData(imageData, 0, 0);
            resolve(canvas);
          };
          imageObject.src = image.src;
        });
        return promise;
      }.bind(this)
    );
  },

  filter: function (data) {
    // intensityBank indexes are integers for each zoom level
    const z = Math.round(this.view.zoom);
    for (let i = 0; i < data.length; i += 4) {
      // Decode the rgba/pixel so I can filter on date ranges
      const slice = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      const values = this.decodeDate(slice);
      //if data is under the year range
      // and it's avaiable for this zoom level
      if (values.year >= this.minYear - 2000 && values.year <= this.maxYear - 2000) {
        const intensityData = this.intensityBank[z]?.[values.intensity];
        if (intensityData) {
          data[i] = intensityData[0];
          data[i + 1] = intensityData[1];
          data[i + 2] = intensityData[2];
          data[i + 3] = intensityData[3];
        }
      } else {
        // Hide the pixel
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      }
    }
    return data;
  },

  decodeDate: function (pixel) {
    return { intensity: pixel[0] || 0, year: pixel[2] };
  },
});

export default TreeCoverLossLayer;
