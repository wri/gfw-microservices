import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import esriRequest from '@arcgis/core/request';

const IndonesiaLandCover = BaseTileLayer.createSubclass({
  getTileUrl: function (level, row, column) {
    return this.urlTemplate.replace('{z}', level).replace('{x}', column).replace('{y}', row);
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
    for (let i = 0; i < data.length; i += 4) {
      const slice = [data[i], data[i + 1], data[i + 2]];
      const values = this.decodeDate(slice);
      if (values.intensity === 0) {
        data[i + 3] = 0;
        data[i + 2] = 0;
        data[i + 1] = 0;
        data[i] = 0;
      }
    }
    return data;
  },

  decodeDate: function (pixel) {
    var band3_str = this.pad(pixel[2].toString());
    // Grab the raw intensity value from the pixel; ranges from 1 - 55
    var intensity_raw = parseInt(band3_str.slice(1, 3));
    // Scale the intensity to make it visible
    var intensity = intensity_raw * 50;
    return {
      intensity: intensity,
    };
  },
  pad: function (num) {
    var str = '00' + num;
    return str.slice(str.length - 3);
  },
});

export default IndonesiaLandCover;
