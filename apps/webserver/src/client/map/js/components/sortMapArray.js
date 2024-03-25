import { mapPage } from '../../../common/js/config';

const sortMapArray = (mapLayer, mapView) => {
  const mapLayerConfigIndex = mapPage.layers.findIndex(
    (configLayer) => configLayer.id === mapLayer.id
  );
  mapView.layers.items.some((layer, index) => {
    const configLayerIndex = mapPage.layers.findIndex((configLayer) => configLayer.id === layer.id);
    // this layer exists in the layer config
    if (configLayerIndex > -1) {
      // get order number for current layer
      const configOrder = mapPage.layers[configLayerIndex].order;
      // get order number for layer to add
      const configOrderToAdd = mapPage.layers[mapLayerConfigIndex].order;

      // THING ABOUT LAYERS:
      // Start of layer array is rendered at the BOTTOM.
      // End of layer array is rendered at the TOP.

      if (configOrder < configOrderToAdd) {
        mapView.layers.reorder(mapLayer, index);
        return true;
      } else if (index === mapView.layers.items.length - 1) {
        mapView.add(mapLayer);
        return true;
      }
    } else if (index === mapView.layers.items.length - 1) {
      // if you get to the end of the array without adding layer yet then add it at the end
      mapView.add(mapLayer);
      return true;
    }
  });
};

export default sortMapArray;
