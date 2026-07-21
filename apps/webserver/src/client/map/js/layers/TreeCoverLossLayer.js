import BaseTileLayer from '@arcgis/core/layers/BaseTileLayer';
import { latestTreeCoverLossYearForTclDataInMap } from '../../../common/js/config';

const TreeCoverLossLayer = BaseTileLayer.createSubclass({
  properties: {
    threshold: 0,
    minYear: 2001,
    maxYear: latestTreeCoverLossYearForTclDataInMap,
  },

  initialize() {
    this.baseRGB = this.properties?.baseRGB || [220, 0, 130];
  },

  getTileUrl(level, row, column) {
    let url = this.urlTemplate
      .replace('{z}', level)
      .replace('{x}', column)
      .replace('{y}', row)
      .replace('{thresh}', this.threshold)
      .replace('{start_year}', this.minYear)
      .replace('{end_year}', this.maxYear);

    if (this.threshold === 0) {
      url = url.replace('tree_cover_density_threshold=0&', '');
    }

    return url;
  },
});

export default TreeCoverLossLayer;
