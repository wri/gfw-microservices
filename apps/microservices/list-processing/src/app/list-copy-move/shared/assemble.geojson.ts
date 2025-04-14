import { GeoJson, GeoService } from '@wri-monorepos/geo';

const isEmpty = (str) => {
  return !str || str.length === 0 || !str.trim(); //check if string is null, empty, or contains only whitespace
};

const expandAttributes = (attributes) => {
  const convertedObject = {};

  if (isEmpty(attributes)) {
    return convertedObject;
  }

  const jsonArray = JSON.parse(attributes);

  try {
    jsonArray.forEach((item) => {
      let value = item.value;

      if (item.type === 'number') {
        value = Number(value); // Convert to number if type is "number"
      }

      convertedObject[item.field] = value;
    });

    return convertedObject;
  } catch (error) {
    return convertedObject;
  }
};

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
        const attributes = expandAttributes(location.properties.attributes);

        geojson.features.push({
          type: 'Feature',
          properties: {
            ...featProps[j],
            ...attributes,
          },
          geometry: location.geometry,
        });
      });

      resolve(geojson);
    }
  });
};
