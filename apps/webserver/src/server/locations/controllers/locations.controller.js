const path = require('path');
const Papa = require('papaparse');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { HttpStatus } = require('@nestjs/common');
import config from '../../../config/config';
const { compiledAssets } = config;
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');

const LocationManager = require('../../../config/publicutils/locationManager.utils');
const ListManager = require('../../../config/publicutils/listManager.utils');
const GFWlistManager = require('../../../config/publicutils/gfwListManager.utils');
const AuthManager = require('../../../config/publicutils/authenticationManager.utils');
const AccountManager = require('../../../config/publicutils/accountManager.utils');
const UserManager = require('../../../config/publicutils/userManager.utils');
const ShareManager = require('../../../config/publicutils/shareManager.utils');
const {
  findSharedListsInsideOrganization,
} = require('../../../config/publicutils/shareManager.utils');
const { formatListLocationDataForFilter } = require('../utils/locations.utils');
const { getCurrentDateTimeFormatted } = require('../../vectorTiles/utils/vectorTile.utils');
const sqlUtils = require('../../../config/privateutils/sql.utils');
const sql = require('mssql');
const { getFilterOptionsForUserLists } = require('@wri-monorepos/sql');

// Config
const { getGeoJSONGeometry } = require('../../../config/privateutils/location.utils');
const { GFW_LISTS_NUMBER_CONSTANTS } = require('../../../config/env/gfwLists.constants');

// Logging
const logger = require('../../../config/privateutils/logger.utils');
const { sendMessageToQueue } = require('../../downloader');
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));

/**
 * @function locations
 * @summary
 * @name exports.locations
 * @static
 * @param req - Express request object
 * @param res - Express response object
 */
export const locations = async (req, res, data) => {
  const isAdministrator = UserManager.isAdministrator(req);
  const fromMap = data && data.fromMap ? data.fromMap : false;
  const subscriptionStatus = data && data.subscriptionStatus ? data.subscriptionStatus : 1;

  try {
    // Prepare queries based on user role - only fetch what's needed
    const listPromises = isAdministrator ? [] : [ListManager.getUserListsWithAnalysisId(req)];

    // Execute all queries in parallel with optimized data fetching
    const results = await Promise.all([
      LocationManager.getAllTemplateData(req),
      LocationManager.getAllTemplateDropdowns(req),
      AuthManager.getUserInfo(req),
      ListManager.getLocationsCount(req),
      GFWlistManager.getGFWLists(req),
      isAdministrator ? AccountManager.getUsersList(req) : Promise.resolve([]),
      ShareManager.getUserInternalShareLists(req, req.session.organization_user_id),
      ListManager.getAllListsWithAnalysisId(req),
      ...listPromises,
    ]);

    const [
      templateData,
      templateDropdowns,
      userInfo,
      locationCount,
      gfwLists,
      usersList,
      sharedListsRecords,
      orgLists,
      userLists,
    ] = results;

    const listStatuses = UserManager.getStatuses();
    const userSharedLists = findSharedListsInsideOrganization(sharedListsRecords, orgLists);

    // Always return all fields with empty values where appropriate
    const renderData = {
      // Core data
      templateData,
      templateDropdowns,
      userInfo,
      locationCount,
      listStatuses,

      // List data - always present but may be empty
      userLists: isAdministrator ? orgLists : userLists,
      userSharedLists: isAdministrator ? [] : userSharedLists,
      orgLists: isAdministrator ? [] : orgLists,
      gfwLists: Array.isArray(gfwLists)
        ? gfwLists.map((list) => ({
            id: list.id,
            list_name: list.list_name,
            template_id: list.template_id,
            analysis_id: list.analysis_id,
          }))
        : [],
      usersList: isAdministrator ? usersList : orgLists,

      // UI assets
      common: compiledAssets.js.common,
      locationsjs: compiledAssets.js.locations,
      locationscss: compiledAssets.css.locations,

      // Environment and state
      fromMap,
      CURRENT_ENVIRONMENT: process.env.NODE_ENV,
      subscriptionStatus,
      organizationId: req.session.organization_id,
    };

    res.render('locations', renderData);
  } catch (err) {
    logger.error(`Locations page failed on the server:, ${err}`);
    const markup = compiledAssets.js['login-component']
      ? renderToString(createElement(compiledAssets.js['login-component'].default))
      : '';
    console.log('Locations page failed on the server:', err);
    res.render('login', {
      critical: compiledAssets.css['login/css/login.scss'],
      common: compiledAssets.js.common,
      loginjs: compiledAssets.js.login,
      markup,
    });
  }
};

/**
 * @function getUserLists
 * @summary
 * @name exports.getUserLists
 * @static
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserLists = (req, res) => {
  const { templateId } = req.query;
  ListManager.getUserLists(req)
    .then((result) => {
      const userLists = templateId
        ? result.filter((list) => list.template_id === parseInt(templateId, 10))
        : result;
      res.status(200).json({ userLists });
    })
    .catch((err) => {
      logger.error(`Locations page failed on the server:, ${err}`);

      console.log('Locations page failed on the server:', err);
      res.status(422).send({ error: 'Unkown error' });
    });
};

/**
 * @description - Get the data to filter a specific list.
 *
 * @param {Object} request - Express request
 * @param {Object} response - Express response
 * @return {Promise} - request Promise
 */
export const listFilterValues = async (request, response) => {
  const { id } = request.params;
  const listId = Number(id);
  try {
    let countryStateAndSubstates;
    let locationNameOptionsForFilter;
    let parentCompanyOptionsForFilter;
    let supplierNameOptionsForFilter;
    let secondSupplierNameOptionsForFilter;

    if (GFWlistManager.isGfwList(listId)) {
      const adminAreasLocations = await GFWlistManager.getGFWListLocationsNoGeom(request, id);

      countryStateAndSubstates = adminAreasLocations.map(
        ({ Country, State, 'Sub State': SubState }) => ({
          Country,
          State,
          'Sub State': SubState,
        })
      );
      if (
        listId === GFW_LISTS_NUMBER_CONSTANTS.OIL_PALM_CONCESSIONS ||
        listId === GFW_LISTS_NUMBER_CONSTANTS.PALM_OIL_MILLS ||
        listId === GFW_LISTS_NUMBER_CONSTANTS.RSPO_PALM_CONCESSIONS
      ) {
        locationNameOptionsForFilter = Array.from(
          new Map(
            adminAreasLocations
              .map(
                ({
                  'Location Name': label,
                  location_id: value,
                  'Sub State': subState,
                  Country: country,
                  State: state,
                  'Parent Company': parentCompany,
                  Certification: certification,
                }) => ({
                  value,
                  label,
                  subState,
                  country,
                  state,
                  parentCompany,
                  certification,
                })
              )
              .filter((location) => !!location.label) // Filter out items with a falsy label
              .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
              .map((location) => [location.label, location]) // Create [label, location] pairs for uniqueness
          ).values() // Extract only unique locations based on the label
        );
      }

      if (listId === GFW_LISTS_NUMBER_CONSTANTS.PALM_OIL_MILLS) {
        parentCompanyOptionsForFilter = Array.from(
          new Map(
            adminAreasLocations
              .map(
                ({
                  'Parent Company': label,
                  location_id: value,
                  'Sub State': subState,
                  Country: country,
                  State: state,
                  Certification: certification,
                }) => ({
                  value,
                  label,
                  subState,
                  country,
                  state,
                  certification,
                })
              )
              .filter((location) => !!location.label) // Filter out items with a falsy label
              .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
              .map((location) => [location.label, location]) // Create [label, location] pairs for uniqueness
          ).values() // Extract only unique locations based on the label
        );
      }
    } else {
      const parameters = [{ field: 'listId', type: sql.Int, value: listId }];

      const queryResult = await sqlUtils.executeOrganizationQuery(
        request,
        getFilterOptionsForUserLists,
        parameters
      );

      countryStateAndSubstates = queryResult[0];

      secondSupplierNameOptionsForFilter = Array.from(
        new Map(
          countryStateAndSubstates
            .map(
              ({
                'Second Supplier Name': label,
                location_id: value,
                'Sub State': subState,
                Country: country,
                State: state,
                Certification: certification,
                'Supplier Name': supplerName,
              }) => ({
                value,
                label,
                subState,
                country,
                state,
                certification,
                supplerName,
              })
            )
            .filter((location) => !!location.label) // Filter out items with a falsy label
            .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
            .map((location) => [location.label, location]) // Create [label, location] pairs for uniqueness
        ).values() // Extract only unique locations based on the label
      );
      supplierNameOptionsForFilter = Array.from(
        new Map(
          countryStateAndSubstates
            .map(
              ({
                'Supplier Name': label,
                location_id: value,
                'Sub State': subState,
                Country: country,
                State: state,
                Certification: certification,
                'Second Supplier Name': secondSupplierName,
              }) => ({
                value,
                label,
                subState,
                country,
                state,
                certification,
                secondSupplierName,
              })
            )
            .filter((location) => !!location.label) // Filter out items with a falsy label
            .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
            .map((location) => [location.label, location]) // Create [label, location] pairs for uniqueness
        ).values() // Extract only unique locations based on the label
      );

      parentCompanyOptionsForFilter = Array.from(
        new Map(
          countryStateAndSubstates
            .map(
              ({
                'Parent Company': label,
                location_id: value,
                'Sub State': subState,
                Country: country,
                State: state,
                Certification: certification,
              }) => ({
                value,
                label,
                subState,
                country,
                state,
                certification,
              })
            )
            .filter((location) => !!location.label) // Filter out items with a falsy label
            .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
            .map((location) => [location.label, location]) // Create [label, location] pairs for uniqueness
        ).values() // Extract only unique locations based on the label
      );
    }
    const filterValues = formatListLocationDataForFilter(countryStateAndSubstates);

    response.status(200).json({
      filterValues,
      locationNameOptionsForFilter,
      parentCompanyOptionsForFilter,
      supplierNameOptionsForFilter,
      secondSupplierNameOptionsForFilter,
    });
  } catch (err) {
    logger.error(`Getting list filter data failed: /listData/filters/${id}. Error message ${err}`);
    response.send({});
  }
};

const startTaskToCreateFile = async (request, response, file) => {
  const { id: listID } = request.params;
  const { type } = request.query;

  try {
    const source = type === 'alerts' ? 'alerts' : 'list';

    const filter = await sendMessageToQueue({ request, file }, source);
    response.status(200).json({ status: 200, filter });
  } catch (err) {
    logger.error(`error to generate csv file to the list ${listID}, Error message ${err}`);
    response.status(500).json({ status: 500 });
  }
};

export const generateShapefile = async (request, response) => {
  await startTaskToCreateFile(request, response, 'shapefile');
};

export const generateCSV = async (request, response) => {
  await startTaskToCreateFile(request, response, 'csv');
};

export const getListLocationGeometry = (req, res) => {
  ListManager.getListLocationGeometry(req)
    .then((result) => {
      const { WKTGeometry } = result[0];
      const geoJSONGeometry = getGeoJSONGeometry(req, WKTGeometry);

      res.status(200).json({
        geojson: geoJSONGeometry,
        success: true,
      });
    })
    .catch((err) => {
      res.status(422).json({
        error: err,
        success: false,
      });
    });
};

/**
 * @description - Get CSV file based on filters for specific list.
 * @param {Object} request - Express request
 * @param {Object} response - Express response
 * @return {Promise<void>}
 */
export const downloadingSelectedLocations = async (request, response) => {
  logger.info('POST /locations/downloadingSelectedLocations');
  const {
    listID,
    orderType,
    sortByAttribute,
    country,
    state,
    subState,
    analysisAreaMin,
    analysisAreaMax,
    columnsToReturn,
    LocationIds,
    LocationLogic,
  } = request.body;

  const filters = {
    orderType,
    sortByAttribute,
    country,
    state,
    subState,
    analysisAreaMin,
    analysisAreaMax,
    columnsToReturn,
    LocationIds,
    LocationLogic,
  };
  try {
    const selectedLocations = await ListManager.getPaginatedAnalysisDataForUserList(
      request,
      listID,
      filters
    );

    // some templates use 'Investment Name' and others 'Location Name'
    const locationNameKey =
      'Investment Name' in selectedLocations[0] ? 'Investment Name' : 'Location Name';

    const csv = Papa.unparse(selectedLocations, {
      columns: ['list_id', 'location_id', locationNameKey, ...columnsToReturn.split(',')],
    });

    const currentDate = getCurrentDateTimeFormatted(); // 20221115_131020
    const filename = `${listID}_${currentDate}.csv`;
    response.attachment(filename);
    response.status(200).send(csv);
  } catch (err) {
    logger.error(`Downloading Selected Locations Failed ${JSON.stringify(err)}`);
    response.status(422).send({
      error: err,
      success: false,
    });
  }
};

/**
 * @description - Get JSON file based on filters for specific list.
 * @param {Object} request - Express request
 * @param {Object} response - Express response
 * @return {Promise<void>}
 */
export const downloadingSelectedLocationsJson = async (request, response) => {
  logger.info('POST /locations/downloadingSelectedLocations/json');
  const {
    listID,
    orderType,
    sortByAttribute,
    country,
    state,
    subState,
    analysisAreaMin,
    analysisAreaMax,
    columnsToReturn,
    LocationIds,
    LocationLogic,
  } = request.body;

  const filters = {
    orderType,
    sortByAttribute,
    country,
    state,
    subState,
    analysisAreaMin,
    analysisAreaMax,
    columnsToReturn,
    LocationIds,
    LocationLogic,
  };

  try {
    const selectedLocations = await ListManager.getPaginatedAnalysisDataForUserList(
      request,
      listID,
      filters
    );
    response.status(200).send(selectedLocations);
  } catch (err) {
    logger.error(`Downloading Selected Locations Failed ${JSON.stringify(err)}`);
    response.status(422).send({
      error: err,
      success: false,
    });
  }
};

export const downloadErrorFile = async (req, res) => {
  try {
    const { fileKey } = req.query;
    // Example of fileKey - `s3://gfwpro-geotrellis-pre-data/development/failed/20221104051534_iizo1ewdla21ee1s-input_cocoageneric_random_50k_r25.csv`
    const basename = path.basename(fileKey);
    const fileKeyClean = fileKey.replace('S3://', '').replace('s3://', '');
    const fileKeyCleanChunks = fileKeyClean.split('/');
    const [bucket, ...keyPathChunks] = fileKeyCleanChunks;
    const key = keyPathChunks.join('/');

    const parameters = {
      Bucket: bucket, // (e.g. 'gfwpro-geotrellis-pre-data')
      Key: key, // (e.g. 'development/failed/20221104051534_iizo1ewdla21ee1s-input_cocoageneric_random_50k_r25.csv')
    };

    const s3client = new S3Client();
    const s3command = new GetObjectCommand(parameters);
    const s3response = await s3client.send(s3command);
    const fileStream = s3response.Body;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fileStream.pipe(res);
    res.attachment(basename);
  } catch (err) {
    logger.error('downloadErrorFile Failed', err);
    res.status(500).send({
      error: err.message,
      success: false,
    });
  }
};

/**
 * @description - Handle edit locations
 * @param {Object} req - Express request
 * @param {number} listID - List ID (e.g. 2038)
 * @param {[]} locationIDs - Location IDs (e.g. [1, 2, 3])
 * @param {[]} attributes - Attributes (e.g. [{'Investment Name': 'ID 30', ...}])
 * @return {Promise<>}
 */
export const handleEditLocations = async (req, listID, locationIDs, attributes) => {
  try {
    const locationsEditedMessageSuccessfully = `List locations Edited for List ID ${listID}: Successfully`;

    // Lock selected list
    const listLockStatusRecord = await ListManager.getListLockStatus(req, listID);
    await ListManager.checkListLockStatus(req, listID, listLockStatusRecord);

    // Edit list locations
    await ListManager.editLocations(req, listID, locationIDs, attributes);

    // Un-Lock selected list
    await ListManager.setListUnlocked(req, listID);
    logger.info(locationsEditedMessageSuccessfully);
    return { locationsEditedMessageSuccessfully };
  } catch (editError) {
    const locationsEditedMessageFailed = `Error editing list locations for List ID ${listID}: Failed`;
    logger.error(locationsEditedMessageFailed, editError);

    // Un-Lock selected list
    await ListManager.setListUnlocked(req, listID);
    return { error: editError, locationsEditedMessageFailed };
  }
};

export const handleListProcessingError = async (
  error,
  req,
  res,
  listName,
  errorMessage,
  url,
  config
) => {
  logger.error(`Error ${url}`, error.stack);
  logger.error(`Error ${url} response.data`, JSON.stringify(error.response?.data));
  logger.error(`Error ${url} data`, error.config?.data);
  const { response } = error;
  const { status = 500, statusText: reason = errorMessage, data = {} } = response || {};

  if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
    req.list = {
      list_name: listName,
    };

    await AWSSES.sendErrorNotificationEmail(
      req,
      config.platformVars.emailType.ANALYSIS_LIMIT_REACHED
    );
  } else {
    await AWSSES.sendErrorNotificationEmail(req, config.platformVars.emailType.LIST_ANALYSIS_ERROR);
  }

  res.status(status).send({
    reason,
    ...data,
  });
};
