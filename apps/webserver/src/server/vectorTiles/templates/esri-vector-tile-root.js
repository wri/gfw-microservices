exports.esriVectorTileRoot = {
  version: 8,
  sources: {
    esri: {
      type: 'vector',
      url: 'http://127.0.0.1:3060/services/VectorTileServer',
    },
  },
  layers: [
    {
      source: 'esri',
      'source-layer': '140k_final',
      minzoom: 0,
      layout: {},
      id: 'gfw-pro-list',
      type: 'fill',
      paint: {
        // 'fill-opacity': 0.5,
        'fill-color': '#ff0000',
      },
    },
    {
      source: 'esri',
      'source-layer': 'Recent_Cocoa_Generic_GPV_I_924',
      minzoom: 0,
      layout: {},
      id: 'gfw-pro-list',
      type: 'fill',
      paint: {
        // 'fill-opacity': 0.5,
        'fill-color': '#ff0000',
      },
    },
  ],
};
