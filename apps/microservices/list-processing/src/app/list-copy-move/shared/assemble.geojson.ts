import { GeoJson, GeoService } from '@wri-monorepos/geo';
import { getListAttributes, ListAttributes, ListsAttrsTypes } from '@wri-monorepos/sql';

const isEmpty = (str) => {
  return !str || str.length === 0 || !str.trim(); //check if string is null, empty, or contains only whitespace
};

const expandAttributes = (locAttributes: string, listAttrFields: Array<ListAttributes>) => {
  const expandedProps = {};

  if (isEmpty(locAttributes)) {
    return expandedProps;
  }

  try {
    const jsonParsedAttributes = JSON.parse(locAttributes);
    listAttrFields.forEach((item) => {
      const value = jsonParsedAttributes[item.attribute_name];

      if (value !== undefined && value !== null) {
        const isNumber = item.attribute_type === ListsAttrsTypes.Number;
        // The actual value does not matter, just need anything that's number or text
        expandedProps[item.attribute_name] = isNumber ? 1 : 'a';
      }
    });
  } catch (error) {
    // If JSON parsing fails, return empty props
    return expandedProps;
  }

  return expandedProps;
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
          // These features will be sent to processUploadData to add any new attributes
          // that are not in the destination list, but processUploadData expects the
          // attributes to be directly in the properties object instead of attributes
          // field in the properties object.  So, we need to expand the attributes
          // field into the properties object.
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
