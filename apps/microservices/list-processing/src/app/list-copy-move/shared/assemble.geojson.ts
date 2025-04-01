import { GeoJson, GeoService } from '@wri-monorepos/geo';

export const assembleGeojson = async (featProps, uploadingData): Promise<GeoJson> => {
  const geoService = new GeoService();
  return new Promise<GeoJson>((resolve, reject) => {
    const geojson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };

    const selectedListData = geoService.createGeoJSON(uploadingData);

    const selectedLocationsIDs = uploadingData.map((location) => location.location_id);

    if (!selectedListData) {
      reject('GEO JSON creation not success');
    } else {
      const feats = selectedListData.features;
      const filteredLocations = feats.filter((location) => {
        return selectedLocationsIDs.indexOf(location.properties.location_id) > -1;
      });

      filteredLocations.forEach((location, j) => {
        geojson.features.push({
          type: 'Feature',
          properties: featProps[j],
          geometry: location.geometry,
        });
      });

      resolve(geojson);
    }
  });
};
