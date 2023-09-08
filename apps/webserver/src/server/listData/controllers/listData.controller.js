const _ = require('lodash');
const path = require('path');

const ListManager = require('../../../config/publicutils/listManager.utils');
const LocationManager = require('../../../config/publicutils/locationManager.utils');
const AnalysisManager = require('../../../config/publicutils/analysisManager.utils');
const logger = require('../../../config/lib/winston');

const { getListDataFiltered } = require('../utils/listData.utils');
const {
  getListAnalysisStatusById,
  createOrUpdateListAnalysis,
} = require('../service/listData.service');
const listUtils = require(path.resolve('./config/privateutils/list.utils'));
/**
 * @description - Get the data from the GFW API for the given info Bubble ID
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.listData = async (req, res) => {
  logger.info(`/listData - Request => Query PARAMS: ${JSON.stringify(req.query)}`);
  const {
    list_id: listID,
    country,
    state,
    subState,
    analysisArea,
    sortByAttribute,
    order,
    page,
    pageSize,
  } = req.query;
  const filters = {
    country,
    state,
    subState,
    analysisArea,
    sortByAttribute,
    order,
    page,
    pageSize,
  };
  const filtersClean = _.pickBy(filters, _.identity);

  try {
    if (listID) {
      const analysesList = await AnalysisManager.getListAnalyses(req, listID);
      const locationsNoGeomList = await ListManager.getListLocationsNoGeom(req, listID);
      const locationAttributeList = await LocationManager.getLocationAttributesList(
        req,
        locationsNoGeomList,
        false
      );
      const analysisDataForUserList = await AnalysisManager.getAnalysisDataForUserList(req, listID);

      const listData = {
        list_analysis: analysesList,
        location_analyses: [locationAttributeList, analysisDataForUserList],
      };

      const listDataFiltered = getListDataFiltered(listData, { ...filtersClean });
      res.status(200).json(listDataFiltered);
    }
  } catch (err) {
    logger.error(`Getting list data failed: /listData. Error message ${err}`);
    res.status(422).send({
      error: err.message,
      success: false,
    });
  }
};

/**
 * @description - Get List data customized by providing a list of columns to be returned
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.listDataCustom = async (req, res) => {
  logger.info(`/listDataCustom - Request => Body PARAMS: ${JSON.stringify(req.body)}`);

  const DEFAULT_COLUMNS_TO_RETURN = 'Latitude,Longitude,location_id';
  const { list_ids: listIDs, columnsToReturn = DEFAULT_COLUMNS_TO_RETURN, filters } = req.body;
  const {
    selectedCountry = '',
    selectedState = '',
    selectedSubState = '',
    selectedAreaMin = 0,
    selectedAreaMax = null,
  } = filters;
  const [listID] = listIDs;

  const queryFilters = {
    listID,
    orderType: 'asc',
    sortByAttribute: 'location_id',
    country: selectedCountry,
    state: selectedState,
    subState: selectedSubState,
    analysisAreaMin: selectedAreaMin,
    analysisAreaMax: selectedAreaMax,
    columnsToReturn,
  };

  try {
    const listLocationsNoGeomCustom = await ListManager.getPaginatedAnalysisDataForUserList(
      req,
      listID,
      queryFilters
    );
    const listLocationsNoGeomCustomFiltered = listLocationsNoGeomCustom.map((location) => {
      return _.pick(location, ['list_id', ...columnsToReturn.split(',')]);
    });
    res.status(200).json(listLocationsNoGeomCustomFiltered);
  } catch (err) {
    logger.error(`Getting list data failed: /listDataCustom. Error message ${err}`);
    res.status(422).send({
      error: err.message,
      success: false,
    });
  }
};

/**
 * @description - get the list analysis status by list id
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.listAnalysis = async (req, res) => {
  const { listId } = req.params;
  const response = await getListAnalysisStatusById(req, listId);
  return res.status(200).json(response);
};

exports.createOrUpdateListAnalysis = async (req, res) => {
  const { listId } = req.params;

  const { analysisIds } = req.body;

  if (analysisIds === undefined || analysisIds === null || analysisIds.length === 0) {
    return res.status(400).json({ message: 'analysisIds is required' });
  }

  try {
    await listUtils.getListNameSchema(req, listId);
  } catch (err) {
    return res.status(400).json({ message: 'listId is not valid' });
  }

  await createOrUpdateListAnalysis(req, listId, analysisIds);
  return res.status(201).json({
    message: 'List analysis created successfully',
  });
};
