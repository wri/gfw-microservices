import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import PNG from 'png-ts';

const TreeCoverGainLayer = BaseTileLayer.createSubclass({
  properties: {
    minYear: 2001,
    maxYear: new Date().getFullYear(),
  },

  getTileUrl(level, row, column) {
    return this.urlTemplate.replace('{z}', level).replace('{x}', column).replace('{y}', row);
  },

  async fetchTile(level, row, column) {
    const url = this.getTileUrl(level, row, column);
    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.imageSmoothingEnabled = false;
    canvas.style.imageRendering = 'pixelated';
    const width = this.tileInfo.size[0];
    const height = this.tileInfo.size[1];
    canvas.width = width;
    canvas.height = height;

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const png = new PNG(new Uint8Array(buffer));
    const pngImage = PNG.load(png.data, canvas);
    const iData = context.createImageData(width, height);
    const pixels = pngImage.decodePixels();

    iData.data.set(this.processData(pixels, level));
    context.putImageData(iData, 0, 0);
    return canvas;
  },

  processData(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const b = data[i + 2];

      const intensity = r;

      const year = 1999.0 + b * 5.0;

      if (year >= this.minYear && year <= this.maxYear && year >= 2001) {
        data[i] = 63; // R
        data[i + 1] = 7; // G
        data[i + 2] = 245; // B
        data[i + 3] = Math.min(Math.floor(8 * intensity), 255); // A
      } else {
        data[i + 3] = 0; // fully transparent
      }
    }

    return data;
  },
});

export default TreeCoverGainLayer;
