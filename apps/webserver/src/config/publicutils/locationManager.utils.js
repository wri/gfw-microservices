/** ******************************************************************
 *   @name : locationManager.utils.js
 *   @description : A utility file to allow GFW Pro to obtain/set
 *                 location data.
 *
 *   @function {getAllTemplateData}
 *   @function {getAllTemplateDropdowns}
 *
 ********************************************************************/
// Imports required for this module.
const path = require('path');
const _ = require('lodash');
const mapshaper = require('mapshaper');
const s3Utils = require(path.resolve('./config/privateutils/s3.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const lambdaUtils = require(path.resolve('./config/privateutils/lambda.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const ListManager = require('./listManager.utils');
const ShareManager = require('./shareManager.utils');

/** @function {getAllTemplateData}
 *   @summary Gets a list of all the latest template metadata
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} Returns promise object. If successful, resolves to array of template metadata, error object otherwise
 */
const getAllTemplateData = (req) => {
  return new Promise((resolve, reject) => {
    // Get list of template metadata
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetTemplateMetadata')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetData,
          'Failed to get Template Metadata',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getAllTemplateDropdowns}
 *   @summary Gets a list of all template dropdown values
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} Returns promise object. If successful, resolves to array of template metadata, error object otherwise
 */
const getAllTemplateDropdowns = (req) => {
  return new Promise((resolve, reject) => {
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetTemplatesDropdown')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetData,
          'Failed to get Template Dropdown',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

const getGADM = (req, geojson) => {
  return new Promise((resolve, reject) => {
    const s3ObjectsToDelete = [];
    const objectName = `gadm-${new Date().getTime()}`;
    s3Utils
      .put(objectName, { geojson: geojson })
      .then((location_s3_info) => {
        s3ObjectsToDelete.push(location_s3_info);

        return lambdaUtils.invoke('controller-admin-areas', {
          receipt_handle: 'NOTARECEIPT',
          s3_location_info: location_s3_info,
          layer: 'gadm',
          dissolve_aoi: false,
          post_process_aoi: false,
        });
      })
      .then((lambdaResult) => {
        const { Payload } = lambdaResult;
        const { bucket, key, errorMessage } = JSON.parse(Payload);

        if (errorMessage) {
          console.log(errorMessage);
          throw new Error('Has error property');
        }

        s3ObjectsToDelete.push({ bucket, key });
        return s3Utils.get(bucket, key);
      })
      .then((s3Object) => {
        Promise.all(s3ObjectsToDelete.map((obj) => s3Utils.del(obj.bucket, obj.key)));
        resolve(s3Object);
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
};

/**
 * Handling Certification column
 * @param {String} column - Column name
 * @param {Object} properties - Location Feature properties
 * @private
 */
const _handlingCertification = (column, properties) => {
  if (properties[column] === 'None') {
    properties[column] = 'No';
  } else if (properties[column].length > 0) {
    properties[column] = 'Yes';
  } else {
    properties[column] = '';
  }
};

/**
 * Get filter List Locations Geojson data
 * @param {Object} listGeojson - Geojson data for selected list
 * @param {Array} locationIDsArray - List of all locations that will be included in final ESRI Geojson
 * @param {Array} includedColumns - List of included Features object Properties
 * @param {String} list_name - List name
 * @returns {Object} - Filtered Geojson object based on included Columns
 */
const getFilterListLocationsGeojson = (listGeojson, locationIDsArray, includedColumns, list_name) => {
  const featuresClone = _.cloneDeep(listGeojson);

  const gfw_list_names = ['Palm Oil Mills', 'Oil Palm Concessions'];

  featuresClone.features = _.compact(
    featuresClone.features.map((feature) => {
      const { properties } = feature;

      if (locationIDsArray.length === 0 || locationIDsArray.includes(properties.location_id)) {
        includedColumns.forEach((column) => {
          if (!properties[column]) {
            properties[column] = '';
          }

          if (gfw_list_names.includes(list_name) && column === 'Certification') {
            _handlingCertification('Certification', properties);
          }

          if (column === 'Analysis Radius' && properties[column] > 0) {
            properties['Analysis Area'] = '';
          }
        });

        return {
          ...feature,
          properties: _.pick(properties, includedColumns),
        };
      }
    })
  );

  return featuresClone;
};

/**
 * Generate Zip Shapefile from filtered Geojson data
 * @param {Object} listFeaturesGeojson - List Features ESRI Geojson
 * @param {Array} locationIDsArray - Selected IDs or all records []
 * @param {String} outputFileName - Output File Name
 * @param {String} outputFileFormat - Output File Format
 * @param {Object} archive - Archive object - Zip file
 * @param {Array} includedColumns - List of Columns included in location attributes
 * @param {String} list_name - List name
 */
const generateZipShapefile = (
  listFeaturesGeojson,
  locationIDsArray,
  outputFileName,
  outputFileFormat,
  archive,
  includedColumns,
  list_name
) => {
  try {
    const filterListLocationsGeojson = getFilterListLocationsGeojson(
      listFeaturesGeojson,
      locationIDsArray,
      includedColumns,
      list_name
    );
    const cmd = `-i ${outputFileName}.geojson -o format=${outputFileFormat}`;

    mapshaper.applyCommands(cmd, { [`${outputFileName}.geojson`]: filterListLocationsGeojson }, (err, output) => {
      const keys = Object.keys(output);
      keys.forEach((key) => {
        archive.append(output[key], { name: key });
      });

      archive.finalize();
    });
  } catch (e) {
    console.log('Error:', e.stack);
  }
};

const EXCLUDE_GFW_LIST_IDS = [4, 5]; // ['Protected Areas', 'RSPO Palm Concessions']

/**
 * Find if list is excluded list based on list `id or associated_gfwlist` number
 * @param {Object} selectedList - Selected List
 * @return {boolean} - [ true/false ] value in case that list is excluded GFW list or not
 */
const findIfListIsExcluded = (selectedList) => {
  const gfwListID = selectedList.id <= 5 ? selectedList.id : selectedList.associated_gfwlist;
  return EXCLUDE_GFW_LIST_IDS.includes(gfwListID);
};

const SALT_NUMBER = 1.131743045982093;

/**
 * Encoding number by multiplying with SALT_NUMBER
 * @param {Number} coordinate - LAT/LONG value to be encoded
 * @return {number} - Encoded LAT/LONG value
 */
const coordinateEncoder = (coordinate) => {
  return coordinate * SALT_NUMBER;
};

/**
 * Decoding number by dividing with SALT_NUMBER to get original value
 * @param {Number} coordinate - LAT/LONG value to be decoded
 * @return {number} - Decoded LAT/LONG value
 */
const coordinateDecoder = (coordinate) => {
  return coordinate / SALT_NUMBER;
};

/**
 * Get list of Locations Attributes Salted to prevent users from getting actual locations
 * @param {Array} locations - List of locations
 * @return {Array} - List of locations with salted LAT/LONG values
 */
const getLocationsAttributesSalted = (locations) => {
  return locations.map((location) => {
    const latitude = location.Latitude;
    const longitude = location.Longitude;
    return {
      ...location,
      Latitude: coordinateEncoder(latitude),
      Longitude: coordinateEncoder(longitude),
    };
  });
};

/**
 * Getting locationAttributeArray checked against list of excluded GFW lists.
 * In case that List belongs to list of Excluded GFW lists implement salting LAT/LONG values to protect original location
 * @param {Object} req - Client request
 * @param {Array} locations - List of locations
 * @param {Boolean} isGfwList - Boolean to determine if we need to filter GFW Lists
 * @return {Promise<Array>} - List of locations original or with salted LAT/LONG values if list is excluded GFW list
 */
const getLocationAttributesList = async (req, locations, isGfwList) => {
  let selectedList;

  if (isGfwList) {
    selectedList = locations[0];
    selectedList.id = locations[0].list_id;
  } else {
    const userLists = await ListManager.getUserLists(req);
    const orgLists = await ListManager.getAllLists(req);
    const sharedListsRecords = await ShareManager.getUserInternalShareLists(req, req.session.organization_user_id);
    const userSharedLists = await ShareManager.findSharedListsInsideOrganization(sharedListsRecords, orgLists);
    selectedList = [...userLists, ...userSharedLists].filter((list) => list.id === locations[0].list_id)[0];
  }

  const isListExcluded = findIfListIsExcluded(selectedList);
  const locationsAttributes = isListExcluded ? getLocationsAttributesSalted(locations) : locations;
  return locationsAttributes;
};

/**
 * UPDATED FOR TICKET #2190
 * Get Final Geojson that can be original Geojson list or list with decoded LAT/LONG values in case that list is excluded GFW list
 * @param {Number} gfw_list_id - GFW list id
 * @param {Object} geojson - Geojson value
 * @return {*} - Original Geojson list or list with decoded LAT/LONG values in case that list is excluded GFW list
 */
const getFinalGeojson = (gfw_list_id, geojson) => {
  if (EXCLUDE_GFW_LIST_IDS.includes(gfw_list_id)) {
    // Geojson Decoder that will process geojson file and return original LAT/LONG values
    geojson.features = geojson.features.map((location) => {
      const properties = location.properties;
      const originalLatitude = coordinateDecoder(properties.Latitude);
      const originalLongitude = coordinateDecoder(properties.Longitude);
      if (gfw_list_id === 4) {
        // If Protected Areas hardcode Commodity to 'Other'
        properties.Commodity = 'Other';
      }
      location.properties = {
        ...properties,
        Latitude: originalLatitude,
        Longitude: originalLongitude,
      };
      return location;
    });
    // If Admin Areas, hardcode Commodity for each feature to 'Other'
  } else if (gfw_list_id === 1) {
    geojson.features = geojson.features.map((location) => {
      const properties = location.properties;
      properties.Commodity = 'Other';
      location.properties = {
        ...properties,
      };
      return location;
    });
  }
  return geojson;
};

module.exports = {
  getAllTemplateData,
  getAllTemplateDropdowns,
  getGADM,
  getFilterListLocationsGeojson,
  generateZipShapefile,
  getLocationAttributesList,
  getFinalGeojson,
  getLocationsAttributesSalted,
};
