const LIST_STATUS = {
  LIST_STATUS_PENDING: 1,
  LIST_STATUS_ACTIVE: 2,
  LIST_STATUS_INACTIVE: 3,
  LIST_STATUS_DRAFT: 4,
  LIST_STATUS_ANALYZING_DIAGNOSTIC: 5,
  LIST_STATUS_ANALYZING_DASHBOARD: 6,
};
export const ContainsPunctuation = (list_name) => {
  return list_name.search(/[^A-Za-z0-9\s]/) > -1;
};

/**
 * Get List Status ID
 *
 * @param {boolean} isSaveAsDraft - Is save as Draft (true/false)
 * @return {number} - List status ID (eg. Pending = 1 || Draft = 4)
 */
export function getListStatusId(isSaveAsDraft) {
  return isSaveAsDraft
    ? LIST_STATUS.LIST_STATUS_DRAFT
    : LIST_STATUS.LIST_STATUS_PENDING;
}

export const discernPropValue = (feature, prop) => {
  let propValue = feature[prop];
  if (prop === 'Accuracy Rating of Location Entered') {
    if (typeof propValue !== 'undefined' && propValue?.toLowerCase) {
      switch (propValue.toLowerCase()) {
        case "don't know":
          propValue = 0;
          break;
        case 'dont know':
          propValue = 0;
          break;
        case 'not confident':
          propValue = 1;
          break;
        case 'moderately confident':
          propValue = 2;
          break;
        case 'very confident':
          propValue = 3;
          break;
        default:
          propValue = 0;
      }
    } else {
      propValue = 0;
    }
  } else if (prop === 'Size of Investment') {
    if (propValue === '') {
      propValue = null;
    }
  }

  return propValue;
};

export function getActiveTye(commodityType: string, currentActiveTye: string) {
  if (commodityType === 'palmOil') {
    return 'palmGeneric';
  } else if (commodityType === 'soy') {
    return 'soyGeneric';
  } else if (commodityType === 'cattle') {
    return 'cattleGeneric';
  } else if (commodityType === 'cocoa') {
    return 'cocoaGeneric';
  }

  return currentActiveTye;
}

export function getCustomAttributeNamesAndGenericFields(
  customAttributes: string,
  templateData
) {
  const customAttributeNames =
    customAttributes.length > 0 ? customAttributes.split(',') : [];
  const genericFields = [];

  templateData.forEach((template) => {
    // Only specify custom attributes if the field name has been changed.
    if (
      template.template_datum_field_name_updated &&
      template.template_datum_field_name_updated !==
        template.template_datum_field_name
    ) {
      customAttributeNames.push(template.template_datum_field_name_updated);
    } else {
      genericFields.push(template.template_datum_field_name);
    }
  });

  return [customAttributeNames, genericFields];
}

export function createfeaturePropsForCommodity(
  locationData,
  customAttributeNames,
  genericFields
) {
  const featProps = [];
  locationData.forEach((feature) => {
    const properties = {};
    Object.keys(feature).forEach((prop) => {
      if (
        prop !== 'checked' &&
        prop !== 'valid' &&
        prop !== 'Attribute1' &&
        prop !== 'Attribute2' &&
        prop !== 'Attribute3' &&
        prop !== 'invalidFields' &&
        prop !== 'type' &&
        prop !== 'geometry'
      ) {
        if (customAttributeNames.indexOf(prop) > -1) {
          //it is a custom attribute
          properties[prop] = feature[prop];
        } else if (genericFields.indexOf(prop) > -1) {
          //it is a normal, expected attribute of this template
          properties[prop] = discernPropValue(feature, prop);
        }
      }
    });

    if (!properties['Start Date']) {
      properties['Start Date'] = '';
    }
    if (!properties['End Date']) {
      properties['End Date'] = '';
    }

    properties['Wind Barrier'] = '';
    properties['Riparian Buffers'] = '';
    properties['Buffer Zones'] = '';
    properties['Latitude'] = feature.Latitude;
    properties['Longitude'] = feature.Longitude;

    if (!properties['Accuracy Rating of Location Entered']) {
      properties['Accuracy Rating of Location Entered'] = null; //"Don't Know";
    }

    featProps.push(properties);
  });

  return featProps;
}

export function createFeaturePropsForNonCommodity(locationData) {
  const featProps = [];
  locationData.forEach((feature) => {
    const properties = {};

    Object.keys(feature).forEach((prop) => {
      if (
        prop !== 'checked' &&
        prop !== 'valid' &&
        prop !== 'invalidFields' &&
        prop !== 'type' &&
        prop !== 'geometry'
      ) {
        properties[prop] = discernPropValue(feature, prop);
      }
    });

    if (!properties['Start Date']) {
      properties['Start Date'] = '';
    }
    if (!properties['End Date']) {
      properties['End Date'] = '';
    }

    properties['Wind Barrier'] = '';
    properties['Riparian Buffers'] = '';
    properties['Buffer Zones'] = '';
    properties['Latitude'] = feature.Latitude;
    properties['Longitude'] = feature.Longitude;

    if (!properties['Accuracy Rating of Location Entered']) {
      properties['Accuracy Rating of Location Entered'] = null; //"Don't Know";
    }
    if (!properties['Investment Name']) {
      properties['Investment Name'] = feature['Location Name'];
    }

    featProps.push(properties);
  });

  return featProps;
}

export function deleteGeoJSONFeatureProperties(geojson): void {
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
}
