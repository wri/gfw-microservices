/**
 * Get PRODES updated Vector Tile Style
 * @param {Object} prodesInitialVectorTileStyle - Initial Vector Tile Style for PRODES
 * @param {number} yearStart - Year Start
 * @param {number} yearEnd - Year End
 * @return {Object} - GFW Vector Tile Style
 */
export const getProdesUpdatedVectorTileStyle = (
  prodesInitialVectorTileStyle,
  yearStart,
  yearEnd
) => {
  const layers = prodesInitialVectorTileStyle.layers.map((layer) => {
    return {
      ...layer,
      filter: layer.filter
        ? [...layer.filter, ['>=', 'year', yearStart], ['<=', 'year', yearEnd]]
        : ['all', ['>=', 'year', yearStart], ['<=', 'year', yearEnd]],
    };
  });

  return {
    ...prodesInitialVectorTileStyle,
    layers: layers,
  };
};
