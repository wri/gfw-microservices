define(['esri/request', 'esri/layers/BaseTileLayer', 'moment'], function (
  esriRequest,
  BaseTileLayer,
  moment
) {
  const START_DATE = '2012-01-01';
  const baseDate = moment.utc(START_DATE);
  const currentDate = moment.utc();

  const FormaLayer = BaseTileLayer.createSubclass({
    properties: {
      period: '48 hours',
      julianFrom: 12000,
      julianTo: new Date().getJulian(),
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
      const startDate = this.startDate;
      const endDate = this.endDate;

      const start =
        startDate && Math.abs(baseDate.diff(startDate, 'days')) !== 0
          ? Math.abs(baseDate.diff(startDate, 'days'))
          : 1;
      const end = Math.abs(baseDate.diff(endDate ? endDate : currentDate, 'days'));

      for (var i = 0; i < data.length; i += 4) {
        const timeLoss = 255 * data[i + 1] + data[i + 2];

        if (timeLoss >= start && timeLoss <= end) {
          data[i] = 220; // R
          data[i + 1] = 102; // G
          data[i + 2] = 153; // B

          var band3_str = this.padNumber(data[i].toString());
          var intensity_raw = parseInt(band3_str.slice(1, 3), 10);
          // Scale the intensity to make it visible
          var intensity = intensity_raw * 55;
          // Set intensity to 255 if it's > than that value
          if (intensity > 255) {
            intensity = 255;
          }

          data[i + 3] = intensity;
        } else {
          // Hide the pixel
          data[i + 3] = 0;
          data[i + 2] = 0;
          data[i + 1] = 0;
          data[i] = 0;
        }
      }
      return data;
    },

    padNumber: function (number) {
      var s = '00' + number;
      return s.substr(s.length - 3);
    },

    pad: function (num) {
      var str = '00' + num;
      return str.slice(str.length - 3);
    },
  });

  return FormaLayer;
});
