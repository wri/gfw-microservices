import { GeoJson, GeoService } from '@wri-monorepos/geo';
import { getListAttributes, ListAttributes } from '@wri-monorepos/sql';

const isEmpty = (str) => {
  return !str || str.length === 0 || !str.trim(); //check if string is null, empty, or contains only whitespace
};

const expandAttributes = (attributes: string, extraFields: Array<ListAttributes>) => {
  const convertedObject = {};

  if (isEmpty(attributes)) {
    return convertedObject;
  }

  const jsonObject = JSON.parse(attributes);

  try {
    extraFields.forEach((item) => {
      let value = jsonObject[item.attribute_name];

      if (item.attribute_type === 1) {
        value = Number(value); // Convert to number if type is "number"
      }

      convertedObject[item.attribute_name] = value;
    });

    return convertedObject;
  } catch (error) {
    return convertedObject;
  }
};

export const assembleGeojson = async (
  featProps,
  uploadingData,
  clientDatabase,
  listId
): Promise<GeoJson> => {
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

      getListAttributes(clientDatabase, listId).then((extraFields) => {
        filteredLocations.forEach((location, j) => {
          const attributes = expandAttributes(location.properties.attributes, extraFields);

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
      });
    }
  });
};
