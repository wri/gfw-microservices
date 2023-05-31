import Deferred from 'dojo/Deferred';

import { locationsPage } from '../../../common/js/config';
import httpRequest from '../../../common/js/utils/httpRequest';
import { deduceActiveId } from '../../../common/js/utils/templateUtils';
import { containsPunctuation } from './lists.utils';
import Polygon from 'esri/geometry/Polygon';
import geojsonUtil from '../../../common/js/utils/arcgis-to-geojson';
import GeometryEngine from 'esri/geometry/geometryEngine';
import { deduceActiveName } from '../../../common/js/utils/templateUtils';
import { saveAsDraftListConfig } from '../../../../config/config/locations.config';
import { getListStatusId, getListValidStatus } from './lists.utils';

// Moved over from addGFW/StepTwo.js
const classificationObj = {
  palmPlantation: { value: 'Property', commodity: 'Palm Oil' },
  palmMill: { value: 'Supply Shed', commodity: 'Palm Oil' },
  investment: { value: 'Supply Shed', commodity: 'Investment' },
  palmGeneric: { value: 'Supply Shed', commodity: 'Palm Oil' },
  palmFarm: { value: 'Property', commodity: 'Palm Oil' },
  cattle: { value: 'Property', commodity: 'Cattle' },
  cattleGeneric: { value: 'Supply Shed', commodity: 'Cattle' },
  beef: { value: 'Supply Shed', commodity: 'Cattle' },
  soyFarm: { value: 'Property', commodity: 'Soy' },
  soySilo: { value: 'Supply Shed', commodity: 'Soy' },
  soyGeneric: { value: 'Supply Shed', commodity: 'Soy' },
  cocoa: { value: 'Property', commodity: 'Cocoa' },
  // other: {value: 'Supply Shed', commodity: 'Other'},
  cocoaGeneric: { value: 'Property', commodity: 'Cocoa' },
  palmOil: { value: 'Supply Shed', commodity: 'Palm Oil' },
};

const filterValidTemplates = (template, activeTemplate, addType, commodityType) => {
  let templateId = 1;
  const validListStatus = getListValidStatus(template.list_status_id);
  if (addType === 'commodity') {
    let active = activeTemplate;

    if (active === 'investment') {
      if (commodityType === 'palmOil') {
        active = 'palmGeneric';
      } else if (commodityType === 'soy') {
        active = 'soyGeneric';
      } else if (commodityType === 'cattle') {
        active = 'cattleGeneric';
      } else if (commodityType === 'cocoa') {
        active = 'cocoaGeneric';
      }
    }
    templateId = deduceActiveId(active);
  }
  return template.template_id === templateId && validListStatus;
};

const filterValidCustom = (userList, customFields) => {
  let validCustom = true;

  const hasCustomAttributes = userList.custom_attribute_names.length > 0;

  if (!hasCustomAttributes && customFields.length === 0) {
    //lets be explicit: no custom attribution involved
    validCustom = true;
  } else if (hasCustomAttributes && customFields.length === 0) {
    validCustom = false;
  } else if (!hasCustomAttributes && customFields.length > 0) {
    validCustom = false;
  } else if (hasCustomAttributes && customFields.length > 0) {
    //figure it out!
    const listCustomAttributes = userList.custom_attribute_names.split(',');
    if (listCustomAttributes.length !== customFields.length) {
      validCustom = false;
    } else {
      //same length, this could work!
      listCustomAttributes.forEach((listCustomAttribute) => {
        if (customFields.indexOf(listCustomAttribute) === -1) {
          validCustom = false;
        }
      });

      customFields.forEach((customField) => {
        if (listCustomAttributes.indexOf(customField) === -1) {
          validCustom = false;
        }
      });
    }
  }

  return validCustom;
};

const discernPropValue = (feature, prop) => {
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

const assembleGeojson = (featProps, uploadingData, listId) => {
  const deferred = new Deferred();
  const geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  const route = '/locations/getUserListLocationSpatialData';
  const body = {
    list_ids: [listId],
  };

  return httpRequest.fetchJSON(route, body).then((response) => {
    const selectedLocationsIDs = uploadingData.map((location) => location.location_id);
    const selectedListData = JSON.parse(response);
    if (selectedListData.errorCode === 604) {
      deferred.reject('listNotAccessible');
    } else {
      const feats = selectedListData[0].features;
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
      deferred.resolve(geojson);
    }
    return deferred;
  });
};

/**
 * @function assembleGfwListGeojson
 *
 * @param {Array} featProps Properties that need to be merged with the geometries
 * @param {Array} geometries Geometries of the polygons that will be analyzed
 * @summary Merges geometries and properties together to form a geojson
 */
const assembleGfwListGeojson = (featProps, geometries) => {
  const geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  geometries.features.forEach((feature) => {
    const property = featProps.find((prop) => {
      return prop.location_id === feature.properties.location_id;
    });

    // Removing temporary location_id that was used to map with geoms
    delete property.location_id;

    geojson.features.push({
      type: 'Feature',
      properties: property,
      geometry: feature.geometry,
    });
    const esriJson = geojsonUtil.geojsonToArcGIS(feature);
    const esriGeometry = new Polygon({
      rings: esriJson.geometry.rings,
      spatialReference: {
        wkid: 4326,
      },
    });

    const area = GeometryEngine.geodesicArea(esriGeometry, 'hectares');
    geojson.features[geojson.features.length - 1].properties['Analysis Area'] = area;
    if (!geojson.features[geojson.features.length - 1].properties['Analysis Radius']) {
      geojson.features[geojson.features.length - 1].properties['Analysis Radius'] = 0;
    }
  });

  return geojson;
};

const getGFWListLocationGeom = (list_id, location_ids) => {
  const deferred = new Deferred();
  httpRequest
    .fetchForm(
      '/locations/getGFWListLocationGeom',
      `list_id=${list_id}&location_ids=${location_ids}`
    )
    .then((response) => {
      const geometries = JSON.parse(response);
      deferred.resolve(geometries);
    })
    .catch((err) => {
      console.warn('error with grabbing gfw location data', err);
      deferred.reject(err);
    });

  return deferred;
};

const addGfwStepTwoFields = (feature, columnsToAdd, sourceListName, addType) => {
  feature.checked = false;
  feature.valid = true;

  columnsToAdd.forEach((column) => {
    feature[column] = '';
  });

  if (addType === 'commodity') {
    if (sourceListName === 'RSPO Palm Concessions') {
      feature.Certification = 'Yes';
    } else if (sourceListName === 'Palm Oil Mills') {
      feature.ID = feature['Mill ID'] ? feature['Mill ID'].toString() : '';
      delete feature['Mill ID'];
      feature['Company ID'] = 'n/a';
      feature['Alternative Mill Name'] = feature['Alternative Name']
        ? feature['Alternative Name'].toString()
        : '';
      delete feature['Alternative Name'];
    } else if (sourceListName === 'Administrative Areas') {
      feature['Location Classification'] = 'Administrative Area';
    } else if (sourceListName === 'Protected Areas') {
      feature['IUCN Category'] = feature['IUCN CAT'] ? feature['IUCN CAT'].toString() : '';
      delete feature['IUCN CAT'];
    }

    if (sourceListName === 'Oil Palm Concessions') {
      switch (feature.Certification.toLowerCase()) {
        case 'none':
          feature.Certification = 'No';
          break;
        case '':
          feature.Certification = '';
          break;
        default:
          feature.Certification = 'Yes';
      }
    }
    // It's an investment
  } else {
    // The Protected Areas list has the names on "Location Name" even though it's an investment
    // when copied.
    if (!feature['Investment Name'] && feature['Location Name']) {
      feature['Investment Name'] = feature['Location Name'];
      feature['Location Name'] = '';
    }
  }

  const analysisFields = {
    'Analysis Radius': '',
    'Analysis Area': '',
  };
  for (const key in feature) {
    if (key === 'Analysis Radius' || key === 'Analysis Area') {
      analysisFields[key] = feature[key];
    }
  }
  if (sourceListName === 'Palm Oil Mills') {
    if (analysisFields['Analysis Radius'] === '' && analysisFields['Analysis Area'] === '') {
      feature.valid = false;
      feature.invalidFields.push('Analysis Radius');
      feature.invalidFields.push('Analysis Area');
    }
  }
};

const saveGfwListLocations = (
  selectedList,
  newListName,
  userListNames,
  userLists,
  selectedNewOrExisting,
  addType,
  activeTemplate,
  commodityType,
  templateData,
  uploadingData,
  selectedLists,
  moveToList,
  isSaveAsDraft
) => {
  const deferred = new Deferred();

  const listName = selectedNewOrExisting === 'new' ? newListName : selectedList.list_name;
  const lowerListName = listName ? listName.toLowerCase() : listName;
  const checkListExists = userListNames.includes(lowerListName);
  const checkForPunctuation = containsPunctuation(lowerListName);

  if (!listName) {
    deferred.reject('invalidListName');
    return deferred;
  } else if (checkListExists && selectedNewOrExisting === 'new') {
    deferred.reject('listNameAlreadyExists');
    return deferred;
  } else if (checkForPunctuation && selectedNewOrExisting === 'new') {
    deferred.reject('invalidListName');
    return deferred;
  }

  const customAttributeHeaders =
    selectedList.list_name === 'Palm Oil Mills'
      ? [
          { field: 'Attribute1', custom: 'Alternative Mill Name' },
          { field: 'Attribute2', custom: 'Group Name' },
          { field: 'Attribute3', custom: 'Attribute3' },
        ]
      : listName === 'Protected Areas'
      ? [
          { field: 'Attribute1', custom: 'IUCN Category' },
          { field: 'Attribute2', custom: 'Designation Type' },
          { field: 'Attribute3', custom: 'Designation' },
        ]
      : [
          { field: 'Attribute1', custom: 'Attribute1' },
          { field: 'Attribute2', custom: 'Attribute2' },
          { field: 'Attribute3', custom: 'Attribute3' },
        ];

  const featProps = [],
    ids = [];
  let templateId;
  const customAttributes = [];

  if (addType === 'commodity') {
    let active = activeTemplate;

    if (active === 'investment') {
      if (commodityType === 'palmOil') {
        active = 'palmGeneric';
      } else if (commodityType === 'soy') {
        active = 'soyGeneric';
      } else if (commodityType === 'cattle') {
        active = 'cattleGeneric';
      } else if (commodityType === 'cocoa') {
        active = 'cocoaGeneric';
      }
    }
    const template_name = deduceActiveName(active);

    const activeTemplates = [];
    const customAttributeNames = [];

    templateData.forEach((template) => {
      if (template.template_name === template_name) {
        if (template.template_datum_field_name === 'Attribute1') {
          if (customAttributeHeaders[0].custom !== 'Attribute1') {
            template.template_datum_field_name_updated = customAttributeHeaders[0].custom;
            customAttributeNames.push(template.template_datum_field_name_updated);
          }
        } else if (template.template_datum_field_name === 'Attribute2') {
          if (customAttributeHeaders[1].custom !== 'Attribute2') {
            template.template_datum_field_name_updated = customAttributeHeaders[1].custom;
            customAttributeNames.push(template.template_datum_field_name_updated);
          }
        } else if (template.template_datum_field_name === 'Attribute3') {
          if (customAttributeHeaders[2].custom !== 'Attribute3') {
            template.template_datum_field_name_updated = customAttributeHeaders[2].custom;
            customAttributeNames.push(template.template_datum_field_name_updated);
          }
        } else {
          activeTemplates.push(template);
        }
      }
    });

    const genericFields = [];

    activeTemplates.forEach((template) => {
      if (
        template.template_datum_field_name !== 'Attribute1' &&
        template.template_datum_field_name !== 'Attribute2' &&
        template.template_datum_field_name !== 'Attribute3'
      ) {
        genericFields.push(template.template_datum_field_name);
      }
    });

    customAttributeNames.forEach((customAtt) => {
      customAttributes.push({
        column_name: customAtt,
        column_type: 'Text',
      });
    });

    templateId = activeTemplates[0].template_id;

    // Figure out which fields are missing from the data we have so we can add them later.
    const columnsToAdd = [];
    templateData.forEach((data) => {
      if (
        data.template_name === template_name &&
        uploadingData[0][data.template_datum_field_name] === undefined
      ) {
        columnsToAdd.push(data.template_datum_field_name);
      }
    });

    uploadingData.forEach((feature) => {
      addGfwStepTwoFields(feature, columnsToAdd, selectedList.list_name, addType);
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
      properties.Latitude = feature.Latitude;
      properties.Longitude = feature.Longitude;
      properties.Size = feature.Size;
      properties.location_id = feature.location_id;

      featProps.push(properties);
      ids.push(feature.location_id);
    });
  } else {
    // Figure out which fields are missing from the data we have so we can add them later.
    const columnsToAdd = [];
    templateData.forEach((data) => {
      if (
        data.template_name === 'Investment' &&
        uploadingData[0][data.template_datum_field_name] === undefined
      ) {
        columnsToAdd.push(data.template_datum_field_name);
      }
    });

    const activeTemplates = templateData.filter((template) => {
      return template.template_name === 'Investment';
    });

    templateId = activeTemplates[0].template_id;

    uploadingData.forEach((feature) => {
      addGfwStepTwoFields(feature, columnsToAdd, selectedList.list_name, addType);
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
      properties.Latitude = feature.Latitude;
      properties.Longitude = feature.Longitude;
      properties.location_id = feature.location_id;

      properties['Analysis Radius'] = '0';

      featProps.push(properties);
      ids.push(feature.location_id);
    });
  }

  getGFWListLocationGeom(selectedLists[0].id, ids)
    .then((geoms) => {
      const geojson = assembleGfwListGeojson(featProps, geoms);

      if (listName) {
        const request = new XMLHttpRequest();
        request.onload = () => {
          if (
            request.responseText === 'LocationAdded' ||
            request.responseText === 'LocationAppended' ||
            request.responseText === saveAsDraftListConfig.success
          ) {
            deferred.resolve(request.responseText);
          } else {
            deferred.reject(request.responseText);
          }
        };

        request.onerror = (err) => {
          deferred.reject(err);
          console.warn(`Error: ${err}`);
        };

        let bigObj;
        // TODO: we're deleting these properties so that the backend call doesn't throw an error.
        // Version 1.1 - we need to add the flag properties back in
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

        const [gfwList] = selectedLists;
        const { id: gfwListId } = gfwList;

        if (selectedNewOrExisting === 'new') {
          const list_id = selectedLists[0].id;
          // rspo, pom, and opc need to have palm analysis if commodity type - their location classification must be a supply shed

          let location_classification;
          if (gfwListId === 1) {
            // GFW List
            // id = 1: Administrative Areas
            location_classification = 'Administrative Area';
          } else {
            // GFW Lists
            // id = 2: Oil Palm Concessions
            // id = 3: Palm Oil Mills
            // id = 4: Protected Areas
            // id = 5: RSPO Palm Concessions
            location_classification = 'Supply Shed';
          }

          bigObj = {
            list_id: list_id,
            list_name: listName,
            template_id: templateId,
            geojson: geojson,
            custom_attributes: customAttributes,
            location_classification,
            gfw_list_id: gfwListId,
            selected_location_ids: geoms.features.map((v) => v.properties.location_id),
            original_gfw_list: true,
            list_status_id: getListStatusId(isSaveAsDraft),
          };

          const requestPath = isSaveAsDraft
            ? saveAsDraftListConfig.route
            : '/locations/addToNewList';
          request.open('POST', requestPath, true);
        } else {
          if (moveToList && moveToList.list_locations_count + geojson.features.length > 1500) {
            deferred.reject('listTooLong');
            return deferred;
          }

          bigObj = {
            list_id: moveToList.id,
            list_name: listName,
            table_name: moveToList.list_name,
            geojson: geojson,
            gfw_list_id: gfwListId,
            selected_location_ids: geoms.features.map((v) => v.properties.location_id),
            appendLocations: true,
            list_analysis_table_name: moveToList.list_analysis_table_name,
            original_gfw_list: true,
            list_status_id: getListStatusId(isSaveAsDraft),
          };
          request.open('POST', '/locations/updateExistingList', true);
        }

        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(bigObj));
      }
    })
    .catch((err) => {
      deferred.reject(err);
      console.warn('err', err);
    });

  gtag('event', 'Next button clicked', {
    'event_category': 'Add GFW Click',
    'event_label': 'User copied locations from a GFW list',
  });
  return deferred;
};

const moveLocations = (
  selectedList,
  userListNames,
  selectedMoveOrCopy,
  selectedNewOrExisting,
  newListName,
  moveToList,
  selectedLocations,
  addType,
  activeTemplate,
  commodityType,
  templateData,
  locationData,
  isSaveAsDraft
) => {
  const deferred = new Deferred();

  const listName = selectedNewOrExisting === 'new' ? newListName : moveToList.list_name;
  const lowerListName = listName ? listName.toLowerCase() : listName;
  const checkListExists = userListNames.find((name) => name === lowerListName);
  const checkForPunctuation = lowerListName ? containsPunctuation(lowerListName) : false;

  if (!listName) {
    deferred.reject('missingListName');
    return deferred;
  } else if (checkListExists && selectedNewOrExisting === 'new') {
    deferred.reject('listNameAlreadyExists');
    return deferred;
  } else if (checkForPunctuation && selectedNewOrExisting === 'new') {
    deferred.reject('invalidListName');
    return deferred;
  }

  const featProps = [];
  let templateId;
  const customAttributes = [];

  if (addType === 'commodity') {
    let active = activeTemplate;
    if (active === 'investment') {
      if (commodityType === 'palmOil') {
        active = 'palmGeneric';
      } else if (commodityType === 'soy') {
        active = 'soyGeneric';
      } else if (commodityType === 'cattle') {
        active = 'cattleGeneric';
      } else if (commodityType === 'cocoa') {
        active = 'cocoaGeneric';
      }
    }

    const customAttributeNames =
      selectedList.custom_attribute_names.length > 0
        ? selectedList.custom_attribute_names.split(',')
        : [];
    const genericFields = [];
    templateData.forEach((template) => {
      // Only specify custom attributes if the field name has been changed.
      if (
        template.template_datum_field_name_updated &&
        template.template_datum_field_name_updated !== template.template_datum_field_name
      ) {
        customAttributeNames.push(template.template_datum_field_name_updated);
      } else {
        genericFields.push(template.template_datum_field_name);
      }
    });

    customAttributeNames.forEach((customAtt) => {
      customAttributes.push({
        column_name: customAtt,
        column_type: 'Text',
      });
    });

    templateId = templateData ? templateData[0].template_id : -1;
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
      properties.Latitude = feature.Latitude;
      properties.Longitude = feature.Longitude;

      if (!properties['Accuracy Rating of Location Entered']) {
        properties['Accuracy Rating of Location Entered'] = "Don't Know";
      }

      featProps.push(properties);
    });
  } else {
    templateId = templateData ? templateData[0].template_id : -1;

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
      properties.Latitude = feature.Latitude;
      properties.Longitude = feature.Longitude;

      if (!properties['Accuracy Rating of Location Entered']) {
        properties['Accuracy Rating of Location Entered'] = "Don't Know";
      }
      if (!properties['Investment Name']) {
        properties['Investment Name'] = feature['Location Name'];
      }

      featProps.push(properties);
    });
  }

  const serverResponses = Object.keys(locationsPage.lists.copyMoveMessages);
  assembleGeojson(featProps, locationData, selectedList.id).then(
    (geojson) => {
      const request = new XMLHttpRequest();
      request.onload = () => {
        const responseText = request.responseText;
        if (responseText.includes('isLocked')) {
          deferred.resolve('listIsLocked');
        } else if (serverResponses.find((r) => r === responseText)) {
          deferred.resolve(responseText);
        } else {
          console.warn('geojson request returned unrecognized response', responseText);
          deferred.reject('serverError');
        }
      };

      request.onerror = (serverError) => {
        console.error(serverError);
        if (serverError === 'listNotAccessible') {
          deferred.reject('listNotAccessible');
        } else {
          deferred.reject('serverError');
        }
      };

      let bigObj;

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

      const { associated_gfwlist } = moveToList ? moveToList : selectedList;
      const gfw_list_id =
        associated_gfwlist === 'null' || !associated_gfwlist ? 0 : associated_gfwlist;
      if (selectedNewOrExisting === 'new') {
        request.open(
          'POST',
          isSaveAsDraft ? saveAsDraftListConfig.route : '/locations/addToNewListEdit',
          true
        );
        const list_id = selectedList.id;
        const list_table_name = selectedList.list_table_name;
        const location_classification = selectedList.location_classification;
        bigObj = {
          list_id: list_id,
          list_name: listName,
          template_id: templateId,
          geojson: geojson,
          custom_attributes: customAttributes,
          location_classification,
          list_table_name: list_table_name,
          gfw_list_id: gfw_list_id,
          list_status_id: getListStatusId(isSaveAsDraft),
        };
      } else if (selectedMoveOrCopy === 'copy') {
        request.open('POST', '/locations/copyLocations', true);

        if (moveToList && moveToList.list_locations_count + geojson.features.length > 1500) {
          deferred.reject('ListTooLarge');
        }

        const src_location_ids = locationData.map((v) => v.location_id);
        bigObj = {
          src_list_id: selectedList.id,
          src_location_ids: src_location_ids,
          dest_list_id: moveToList.id,
          geojson: geojson,
          gfw_list_id: gfw_list_id,
          list_status_id: getListStatusId(isSaveAsDraft),
        };
      } else if (selectedNewOrExisting === 'existing') {
        request.open('POST', '/locations/moveLocations', true);
        if (moveToList.list_locations_count + geojson.features.length > 1500) {
          deferred.reject('ListTooLarge');
        }

        const src_location_ids = locationData.map((v) => v.location_id);
        const delete_src_list = selectedList.list_locations_count === selectedLocations.length;
        bigObj = {
          src_list_id: selectedList.id,
          src_location_ids: src_location_ids,
          dest_list_id: moveToList.id,
          geojson: geojson,
          gfw_list_id: gfw_list_id,
          delete_src_list: delete_src_list,
          list_status_id: getListStatusId(isSaveAsDraft),
        };
      } else {
        console.warn('did not recognize condition for ', selectedMoveOrCopy, selectedNewOrExisting);
      }

      request.setRequestHeader('Content-Type', 'application/json');
      request.send(JSON.stringify(bigObj));
    },
    (geojsonError) => {
      console.warn('failed to assemble geojson:', geojsonError);
      deferred.reject('serverError');
    }
  );

  return deferred;
};

module.exports = {
  discernPropValue,
  filterValidTemplates,
  moveLocations,
  saveGfwListLocations,
  assembleGeojson,
  filterValidCustom,
};
