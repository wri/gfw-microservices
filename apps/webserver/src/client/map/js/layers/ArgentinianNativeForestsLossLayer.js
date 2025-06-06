import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import esriRequest from '@arcgis/core/request';
import { latestTreeCoverLossYearForTclDataInMap } from '../../../common/js/config';

const createScalePowerFunction = (exponent) => {
  const intercept = 0;
  const slope = 256 / Math.pow(256, exponent);
  return (value) => Math.pow(value, exponent) * slope + intercept;
};

const clamp = (value) => Math.max(0, Math.min(255, value));

const populateIntensityBank = () => {
  const intensityBank = {};
  for (let zoom = 1; zoom < 21; zoom++) {
    const exponent = zoom < 11 ? 0.3 + (zoom - 3) / 20 : 1;
    const intensityScaleFunction = createScalePowerFunction(exponent);
    intensityBank[zoom] = Array.from({ length: 256 }, (_, intensity) =>
      clamp(intensityScaleFunction(intensity))
    );
  }
  return intensityBank;
};

const ArgentinianNativeForestsLossLayer = BaseTileLayer.createSubclass({
  properties: {
    threshold: 30,
    minYear: 2001,
    maxYear: latestTreeCoverLossYearForTclDataInMap,
  },

  initialize() {
    this.intensityBank = populateIntensityBank();
    this.baseRGB = this.properties?.baseRGB || [220, 0, 130];
  },

  getTileUrl(level, row, column) {
    return this.urlTemplate
      .replace('{z}', level)
      .replace('{x}', column)
      .replace('{y}', row)
      .replace('{thresh}', this.threshold);
  },

  fetchTile(level, row, column) {
    // call getTileUrl() method to construct the URL to tiles
    // for a given level, row and col provided by the LayerView
    const url = this.getTileUrl(level, row, column);
    // request for tiles based on the generated url
    // set allowImageDataAccess to true to allow
    // cross-domain access to create WebGL textures for 3D.
    return esriRequest(url, {
      responseType: 'image',
      allowImageDataAccess: true,
    }).then((response) => this.processTileImage(response.data));
  },

  processTileImage(image) {
    const [width, height] = this.tileInfo.size;
    // create a canvas with 2D rendering context
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    // Draw the blended image onto the canvas.
    context.drawImage(image, 0, 0, width, height);
    // We use a promise because we can't return an empty canvas before the image data has loaded, been filtered, and properly colored
    return new Promise((resolve) => {
      const imageObject = new Image();
      imageObject.crossOrigin = 'Anonymous';
      imageObject.onload = () => {
        context.drawImage(imageObject, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        const filteredData = this.filter(imageData.data);
        imageData.data.set(filteredData);
        context.putImageData(imageData, 0, 0);
        resolve(canvas);
      };
      imageObject.src = image.src;
    });
  },

  filter(data) {
    // intensityBank indexes are integers for each zoom level
    const zoom = Math.round(this.view.zoom);
    const [red, green, blue] = this.baseRGB;

    const newData = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      // Decode the rgba/pixel so I can filter on date ranges
      const { intensity, year } = this.decodeDate([r, g, b, a]);
      //if data is under the year range
      // and it's avaiable for this zoom level
      if (year >= this.minYear - 2000 && year <= this.maxYear - 2000) {
        const alpha = this.intensityBank[zoom]?.[intensity];
        newData[i] = red;
        newData[i + 1] = green;
        newData[i + 2] = blue;
        newData[i + 3] = alpha;
      } else {
        // Hide the pixel
        newData[i] = newData[i + 1] = newData[i + 2] = newData[i + 3] = 0;
      }
    }
    return newData;
  },

  /**
   * Decodes the date from the RGBA pixel values.
   * @param {number[]} pixel - The RGBA values of a pixel.
   * @returns {Object} The decoded intensity and year.
   */
  decodeDate([red, , blue]) {
    return { intensity: red || 0, year: blue };
  },
});

export default ArgentinianNativeForestsLossLayer;
