const path = require('path');
const Papa = require('papaparse');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const { compiledAssets } = require('../../../config/config');
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

// Config
const { getGeoJSONGeometry } = require('../../../config/privateutils/location.utils');

// Logging
const logger = require('../../../config/privateutils/logger.utils');
const { sendMessageToQueue } = require('../../downloader');

/**
 * @function locations
 * @summary
 * @name exports.locations
 * @static
 * @param req - Express request object
 * @param res - Express response object
 */
exports.locations = (req, res, data) => {
  const isAdministrator = UserManager.isAdministrator(req);

  const mapData = data && data.mapData ? data.mapData : false;
  const gfwData = data && data.gfwData ? data.gfwData : false;
  const goToEditList = data && data.goToEditList ? data.goToEditList : false;
  const drawData = data && data.drawData ? data.drawData : false;
  const locationName = data && data.locationName ? data.locationName : '';
  const fromMap = data && data.fromMap ? data.fromMap : false;
  const subscriptionStatus = data && data.subscriptionStatus ? data.subscriptionStatus : 1;

  const promises = [
    LocationManager.getAllTemplateData(req),
    LocationManager.getAllTemplateDropdowns(req),
    ListManager.getUserListsWithAnalysisId(req),
    AuthManager.getUserInfo(req),
    ListManager.getLocationsCount(req),
    ListManager.getAllListsWithAnalysisId(req),
    GFWlistManager.getGFWLists(req),
    AccountManager.getUsersList(req),
    ShareManager.getUserInternalShareLists(req, req.session.organization_user_id),
  ];

  Promise.all(promises)
    .then((results) => {
      const [
        templateData,
        templateDropdowns,
        userLists,
        userInfo,
        locationCount,
        orgLists,
        gfwLists,
        usersList,
        sharedListsRecords,
      ] = results;
      const listStatuses = UserManager.getStatuses();

      const userSharedLists = findSharedListsInsideOrganization(sharedListsRecords, orgLists);
      res.render('locations', {
        templateData,
        templateDropdowns,
        userLists,
        userSharedLists: isAdministrator ? [] : userSharedLists,
        userInfo,
        organizationId: req.session.organization_id,
        locationCount,
        orgLists,
        gfwLists,
        usersList: isAdministrator ? usersList : [],
        common: compiledAssets.js.common,
        locationsjs: compiledAssets.js.locations,
        locationscss: compiledAssets.css.locations,
        mapData,
        gfwData,
        goToEditList,
        drawData,
        locationName,
        fromMap,
        listStatuses,
        CURRENT_ENVIRONMENT: process.env.NODE_ENV,
        subscriptionStatus,
      });
    })
    .catch((err) => {
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
    });
};

/**
 * @function getUserLists
 * @summary
 * @name exports.getUserLists
 * @static
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserLists = (req, res) => {
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
exports.listFilterValues = async (request, response) => {
  const { id } = request.params;

  try {
    let adminAreasLocations;

    if (GFWlistManager.isGfwList(Number(id))) {
      adminAreasLocations = await GFWlistManager.getGFWListLocationsNoGeom(request, id);
      adminAreasLocations = adminAreasLocations.map(
        ({ Country, State, 'Sub State': SubState }) => ({
          Country,
          State,
          'Sub State': SubState,
        })
      );
    } else {
      adminAreasLocations = await ListManager.getListAdminAreasOrderedByCountry(request, id);
    }

    const filterValues = formatListLocationDataForFilter(adminAreasLocations);

    response.status(200).json(filterValues);
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

exports.generateShapefile = async (request, response) => {
  await startTaskToCreateFile(request, response, 'shapefile');
};

exports.generateCSV = async (request, response) => {
  await startTaskToCreateFile(request, response, 'csv');
};

exports.getListLocationGeometry = (req, res) => {
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
exports.downloadingSelectedLocations = async (request, response) => {
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
exports.downloadingSelectedLocationsJson = async (request, response) => {
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

exports.downloadErrorFile = async (req, res) => {
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
exports.handleEditLocations = async (req, listID, locationIDs, attributes) => {
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
