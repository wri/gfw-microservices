const _ = require('lodash');
const path = require('path');

const ListManager = require('../../../config/publicutils/listManager.utils');
const LocationManager = require('../../../config/publicutils/locationManager.utils');
const AnalysisManager = require('../../../config/publicutils/analysisManager.utils');
const logger = require('../../../config/privateutils/logger.utils');

const { getListDataFiltered } = require('../utils/listData.utils');
const listUtils = require(path.resolve('./config/privateutils/list.utils'));

const {
  geoTrellisAnalyzeListController,
} = require('../../geoTrellis/controllers/geoTrellis.controller');

import { analysisTypes, listStatus, AlertsAnalysisFrequency } from '@wri-monorepos/constants';
import { getListAnalysisStatusByListId, setSelectedAnalyses } from '@wri-monorepos/geo';
import { featureFlagsService } from '@wri-monorepos/shared';
import axios from 'axios';
import { retryWithDelay, isRetryableError } from '@wri-monorepos/shared/utils/retry';

/**
 * @description - Get the data from the GFW API for the given info Bubble ID
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
export const listData = async (req, res) => {
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
export const listDataCustom = async (req, res) => {
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
export const getSelectedAnalyses = async (req, res) => {
  const { listId } = req.params;
  try {
    const { organization_database } = req.session;

    const response = await getListAnalysisStatusByListId(organization_database, listId);
    return res.status(200).json(response);
  } catch (err) {
    logger.error(`Getting list analysis failed: Error message ${err}`);
    return res.status(400).json({ message: 'listId is not valid' });
  }
};

export const setSelectedAnalysesCtrl = async (req, res) => {
  const { listId } = req.params;
  const { organization_database } = req.session;

  const { saveAsDraft, selectedAnalysis, isAddingAnalysis, newAnalysesToRun } = req.body;

  if (
    (selectedAnalysis === undefined ||
      selectedAnalysis === null ||
      selectedAnalysis.length === 0) &&
    !saveAsDraft
  ) {
    return res.status(400).json({ message: 'analysisIds is required' });
  }

  try {
    let isWeeklyAlertsEnabled = false; // default to disallowing Weekly (fail closed)
    let orgId;
    try {
      const { getFeatureFlagsForCurrentOrg, getClientIdByClientStoreDatabaseName } =
        await featureFlagsService();
      orgId = await getClientIdByClientStoreDatabaseName(organization_database);
      const orgFlags = await getFeatureFlagsForCurrentOrg(orgId);
      isWeeklyAlertsEnabled = orgFlags.some(
        (f) => f.flagId === 'WeeklyAlerts' && f.flagState === true
      );
    } catch (flagError) {
      logger.warn(
        `Failed to check WeeklyAlerts feature flag, defaulting to disabled: ${flagError}`
      );
    }

    if (selectedAnalysis && selectedAnalysis.length > 0) {
      const validAnalysisIds = new Set([
        ...Object.values(analysisTypes),
        ...(isWeeklyAlertsEnabled ? [AlertsAnalysisFrequency.WEEKLY] : []),
      ]);
      if (selectedAnalysis.some((analysisId) => !validAnalysisIds.has(analysisId))) {
        return res.status(400).json({ message: 'analysisIds is not valid' });
      }
    }

    const statusToApply = saveAsDraft ? listStatus.Draft : listStatus.Pending;
    await setSelectedAnalyses(
      organization_database,
      listId,
      selectedAnalysis,
      statusToApply,
      orgId
    );

    if (isAddingAnalysis && !saveAsDraft) {
      // Because GHG analysis is only valid via EAPI
      const analysesForGeoTrellis = newAnalysesToRun.filter(
        (analysisId) =>
          analysisId !== analysisTypes.GREENHOUSE_GAS_EMISSIONS &&
          analysisId !== AlertsAnalysisFrequency.WEEKLY
      );

      if (analysesForGeoTrellis.length === 0) {
        return res.status(201).json({
          message: 'List analysis selection created successfully',
        });
      }

      const list = await listUtils.getListNameSchema(req, listId);

      req.body = {
        list,
        analysisTypes: analysesForGeoTrellis.join(','),
        reanalyze: true,
      };

      // delegate to the geoTrellis controller
      return await geoTrellisAnalyzeListController(req, res);
    }

    return res.status(201).json({
      message: 'List analysis selection created successfully',
    });
  } catch (err) {
    logger.error(`List analysis selection error: ${err}`);
    return res.status(400).json({ message: 'create list analysis failed' });
  }
};

export const getListCommodity = async (req, res) => {
  const { listId } = req.params;
  const organizationDatabase = req.session.organization_database;

  try {
    const url = `${process.env.LISTS_MICROSERVICE_URL}/commodity/by-list?listId=${listId}&organizationDatabase=${organizationDatabase}`;
    const { data } = await axios.get(url);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching commodity data:', error);
    res.status(500).json({ error: 'Failed to fetch commodity data' });
  }
};

export const getListByCommodity = async (req, res) => {
  const { commodity } = req.query;
  const organizationDatabase = req.session.organization_database;

  if (!commodity) {
    return res.status(400).json({ error: 'commodity is required' });
  }

  try {
    const url = `${process.env.LISTS_MICROSERVICE_URL}/commodity/all-lists?commodity=${commodity}&organizationDatabase=${organizationDatabase}`;

    const { data } = await axios.get(url);
    res.status(200).json(data);
  } catch (error) {
    logger.error('Error fetching commodity data:', error);
    res.status(500).json({ error: 'Failed to fetch commodity data' });
  }
};

export const getPreviewData = async (req, res) => {
  const { path } = req.query;

  try {
    const url = `${process.env.LISTS_MICROSERVICE_URL}/list/upload/preview`; // preview.list.upload.controller.ts

    const { data } = await retryWithDelay(
      () => axios.post(url, { path }, { headers: { 'Content-Type': 'application/json' } }),
      { retries: 3, delayMs: 1000, isRetryable: isRetryableError, logger }
    );
    res.status(200).json(data);
  } catch (error) {
    logger.error('❌ Error getting the preview data:', error);
    res
      .status(error.response?.status || 400)
      .json(error.response?.data || { message: 'Failed to fetch preview data' });
  }
};
