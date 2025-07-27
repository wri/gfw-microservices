/** ******************************************************************
 *   @name : locationManager.utils.js
 *   @description : A utility file to allow GFW Pro to obtain/set
 *                 location data.
 *
 *   @function {getAllTemplateData}
 *
 ********************************************************************/
// Imports required for this module.
const _ = require('lodash');
const mapshaper = require('mapshaper');
import * as sqlUtils from '../privateutils/sql.utils';
import * as errorUtils from '../privateutils/error.utils';
const ListManager = require('./listManager.utils');
const ShareManager = require('./shareManager.utils');

/** @function {getAllTemplateData}
 *   @summary Gets a list of all the latest template metadata
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} Returns promise object. If successful, resolves to array of template metadata, error object otherwise
 */
export const getAllTemplateData = (req) => {
  return new Promise((resolve, reject) => {
    // Get list of template metadata
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetTemplateMetadata', null)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.ERROR_CODES.failedToGetData,
          'Failed to get Template Metadata',
          errorMessage
        );
        reject(errorObject);
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
export const getFilterListLocationsGeojson = (
  listGeojson,
  locationIDsArray,
  includedColumns,
  list_name
) => {
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
export const generateZipShapefile = (
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

    mapshaper.applyCommands(
      cmd,
      { [`${outputFileName}.geojson`]: filterListLocationsGeojson },
      (err, output) => {
        const keys = Object.keys(output);
        keys.forEach((key) => {
          archive.append(output[key], { name: key });
        });

        archive.finalize();
      }
    );
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
export const getLocationsAttributesSalted = (locations) => {
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
export const getLocationAttributesList = async (req, locations, isGfwList) => {
  let selectedList;

  if (isGfwList) {
    selectedList = locations[0];
    selectedList.id = locations[0].list_id;
  } else {
    /**
     * ---
     * TODO: determine if the following is tech debt
     * `getAllLists` calls SP getAllLists
     * `getUserLists` calls SP getAllLists where user_access = admin, otherwise getUserLists
     * ---> essentially running same query twice for admin users
     * ---
     */
    const userLists = await ListManager.getUserLists(req);
    const orgLists = await ListManager.getAllLists(req);
    const sharedListsRecords = await ShareManager.getUserInternalShareLists(
      req,
      req.session.organization_user_id
    );
    const userSharedLists = ShareManager.findSharedListsInsideOrganization(
      sharedListsRecords,
      orgLists
    );
    selectedList = [...userLists, ...userSharedLists].filter(
      (list) => list.id === locations[0].list_id
    )[0];
  }

  const isListExcluded = findIfListIsExcluded(selectedList);
  const locationsAttributes = isListExcluded ? getLocationsAttributesSalted(locations) : locations;
  return locationsAttributes;
};
