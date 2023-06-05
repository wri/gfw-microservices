define(['esri/request', 'esri/layers/BaseTileLayer'], function (esriRequest, BaseTileLayer) {
  const AboveGroundLayer = BaseTileLayer.createSubclass({
    properties: {
      threshold: 30,
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
      // const z = this.view.zoom;

      for (var i = 0; i < data.length; i += 4) {
        // Decode the rgba/pixel so I can filter on confidence and date ranges
        var slice = [data[i], data[i + 1], data[i + 2]];
        const values = this.decodeIntensity(slice);
        data[i] = 255 - values.intensity;
        data[i + 1] = 128;
        data[i + 2] = 0;
        data[i + 3] = values.intensity;
      }
      return data;
    },

    decodeIntensity: function (pixel) {
      const intensity = pixel[2];
      return { intensity: intensity };
    },

    // createLayerView: function(view) {
    //   return promiseUtils.resolve(new TiledLayerView2D({
    //     layer: this,
    //     view: view,
    //     setThreshold: function(threshold) {
    //       this.threshold = threshold;
    //     },
    //     fetchTile: function(key) {
    //       const promise = new Deferred();
    //
    //       const getTileUrl = (level, row, col, threshold) => {
    //         return this.layer.urlTemplate.replace('{thresh}', threshold).replace('{z}', level).replace('{x}', col).replace('{y}', row); //TODO: Don't hardcode 30%!
    //       };
    //       const url = getTileUrl(key.level, key.row, key.col, this.layer.threshold);
    //
    //       esriRequest(url, {
    //         responseType: 'image'
    //       }).then((response) => {
    //
    //         const decodeIntensity = (pixel) => {
    //           const intensity = pixel[2];
    //
    //           return {
    //             intensity: intensity
    //           };
    //         };
    //
    //         const filter = data => {
    //           for (var i = 0; i < data.length; i += 4) {
    //             const slice = [data[i], data[i + 1], data[i + 2]];
    //             const values = decodeIntensity(slice);
    //
    //             data[i] = 255 - values.intensity;
    //             data[i + 1] = 128;
    //             data[i + 2] = 0;
    //             data[i + 3] = values.intensity;
    //
    //           }
    //           return data;
    //         };
    //
    //         const image = response.data;
    //
    //         image.src = image.src + '?' + new Date().getTime();
    //
    //         const width = this.layer.tileInfo.size[0];
    //         const height = this.layer.tileInfo.size[0];
    //
    //         const canvas = document.createElement('canvas');
    //         const context = canvas.getContext('2d');
    //
    //         canvas.width = width;
    //         canvas.height = height;
    //
    //         var imgObj = new Image();
    //         imgObj.crossOrigin = 'Anonymous';
    //
    //         imgObj.onload = () => {
    //           context.drawImage(imgObj, 0, 0, width, height);
    //           const imageData = context.getImageData(0, 0, width, height);
    //           imageData.data.set(filter(imageData.data));
    //           context.putImageData(imageData, 0, 0);
    //
    //           const source = new BitmapSource(canvas);
    //           source.coords = this.getTileCoords(source.coords, key);
    //           source.resolution = this.getTileResolution(key);
    //
    //           return promise.resolve(new Bitmap(source));
    //         };
    //
    //         imgObj.src = image.src.split('?')[0];
    //
    //       });
    //       return promise;
    //     }
    //
    //   }));
    // }
  });

  return AboveGroundLayer;
});
