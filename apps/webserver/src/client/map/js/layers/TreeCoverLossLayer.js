import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import { latestTreeCoverLossYearForTclDataInMap } from '../../../common/js/config';

const TreeCoverLossLayer = BaseTileLayer.createSubclass({
  properties: {
    threshold: 30,
    minYear: 2001,
    maxYear: latestTreeCoverLossYearForTclDataInMap,
  },

  initialize() {
    this.baseRGB = this.properties?.baseRGB || [220, 0, 130];
  },

  getTileUrl(level, row, column) {
    return this.urlTemplate
      .replace('{z}', level)
      .replace('{x}', column)
      .replace('{y}', row)
      .replace('{thresh}', this.threshold)
      .replace('{start_year}', this.minYear)
      .replace('{end_year}', this.maxYear);
  },
});

export default TreeCoverLossLayer;
