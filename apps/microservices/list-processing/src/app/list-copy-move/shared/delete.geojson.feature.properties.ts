export const deleteGeoJSONFeatureProperties = (geojson): void => {
  geojson.features.forEach((feature) => {
    delete feature.properties.list_id;
    delete feature.properties.location_id;
    delete feature.properties.flag_forma;
    delete feature.properties.flag_general;
    delete feature.properties.flag_glad;
    delete feature.properties.flag_gran_chaco;
    delete feature.properties.flag_terrai;
    delete feature.properties.flag_viirs;
  });
};
