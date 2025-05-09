import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import esriRequest from '@arcgis/core/request';

const IndonesiaLandCover = BaseTileLayer.createSubclass({
  getTileUrl: function (level, row, column) {
    return this.urlTemplate.replace('{z}', level).replace('{x}', column).replace('{y}', row);
  },
  fetchTile(level, row, column) {
    const url = this.getTileUrl(level, row, column);
    return esriRequest(url, {
      responseType: 'image',
      allowImageDataAccess: true,
    }).then((response) => {
      const image = response.data;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const width = this.tileInfo.size[0];
      const height = this.tileInfo.size[1];
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      return canvas;
    });
  },
});

export default IndonesiaLandCover;
