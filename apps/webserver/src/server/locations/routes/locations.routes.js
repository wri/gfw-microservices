/* eslint-disable no-shadow */
/* eslint-disable camelcase */
const path = require('path');
const archiver = require('archiver');
import axios from 'axios';
const _ = require('lodash');

const controller = require('../controllers/locations.controller');
const logger = require('../../../config/privateutils/logger.utils');

const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const LocationManager = require(path.resolve('./config/publicutils/locationManager.utils'));
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));

const { generateZipShapefile } = require('../../../config/publicutils/locationManager.utils');
const shareManager = require('../../../config/publicutils/shareManager.utils');
const { getLocationIdsFromGeoJSON } = require('../../../config/publicutils/listManager.utils');
const { saveAsDraftListConfig } = require('../../../config/config/locations.config');
const { removeExistingVectorTileFromS3 } = require('../../vectorTiles/utils/vectorTile.utils');
const { validateAttributes } = require('../utils/validation.utils');
const { mapCommodityRiskValuesToDatabaseValues } = require('../utils/locations.utils');
const { listStatus } = require(path.resolve('./config/env/listStatuses.constants'));
import config from '../../../config/config';

import { extractAnalysisTypes, getListAnalysisStatusByListId } from '@wri-monorepos/geo';

/**
 * @name exports
 * @static
 * @summary Location page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /locations
   * @see locations.controller
   * @memberof Router
   */

  // All methods under /locations must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/locations', routeMiddlewares);

  app.get('/locations', (req, res) => {
    const locationsData = {
      fromMap: app.get('from-map'),
      subscriptionStatus: req.session.subscription_status_id,
    };

    controller.locations(req, res, locationsData);
    // TODO: investigate if the variable from-map works correctly
    app.set('from-map', false);
  });

  app.get('/getUserLists', (req, res) => {
    controller.getUserLists(req, res);
  });

  app.post('/locations/addToNewList', (req, res) => {
    console.log('POST /locations/addToNewList');
    const {
      list_name,
      template_id,
      commodity,
      geojson,
      location_classification,
      gfw_list_id,
      selected_location_ids: src_location_ids,
      original_gfw_list,
      analysisIds,
      attributes,
    } = req.body;
    const finalGeojson = LocationManager.getFinalGeojson(gfw_list_id, geojson);
    const custom_attributes = req.body.custom_attributes ? req.body.custom_attributes : [];

    ListManager.uploadToNewList(
      req,
      list_name,
      template_id,
      commodity,
      location_classification,
      req.session.organization_id,
      custom_attributes,
      finalGeojson,
      gfw_list_id,
      false,
      analysisIds,
      attributes
    )
      .then(async ({ resultGeoJSON }) => {
        const dest_list = await ListManager.getListByListName(req, list_name);

        // Call Location Level Analysis
        if (original_gfw_list) {
          // Copy Locations Analysis if list created from original GFW list
          const src_list = await GFWListManager.getGFWListSchema(req, gfw_list_id);
          const dest_location_ids = resultGeoJSON.features.map(
            (feature) => feature.properties.location_id
          );
          dest_location_ids.sort((a, b) => a - b);

          await GFWListManager.copyGFWLocationsToList(
            req,
            src_list,
            dest_list,
            src_location_ids,
            dest_location_ids
          );
        }

        // Call List Level Analysis
        await AnalysisManager.requestAnalysis(req, dest_list.list_name);

        res.send('LocationAdded');
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send('Location add failed');
      });
  });

  app.post(saveAsDraftListConfig.route, (req, res) => {
    console.log(`POST ${saveAsDraftListConfig.route}`);
    const {
      list_name,
      template_id,
      commodity,
      geojson,
      location_classification,
      gfw_list_id,
      selected_location_ids: src_location_ids,
      original_gfw_list,
      analysisIds,
      attributes = null,
    } = req.body;

    const finalGeojson = LocationManager.getFinalGeojson(gfw_list_id, geojson);
    const custom_attributes = req.body.custom_attributes ? req.body.custom_attributes : [];

    ListManager.uploadToNewListAndSaveAsDraft(
      req,
      list_name,
      template_id,
      commodity,
      location_classification,
      custom_attributes,
      finalGeojson,
      gfw_list_id,
      analysisIds,
      attributes
    )
      .then(async ({ resultGeoJSON }) => {
        if (original_gfw_list) {
          // Copy GFW Locations to another list
          const src_list = await GFWListManager.getGFWListSchema(req, gfw_list_id);
          const dest_list = await ListManager.getListByListName(req, list_name);
          const dest_location_ids = resultGeoJSON.features.map(
            (feature) => feature.properties.location_id
          );
          dest_location_ids.sort((a, b) => a - b);

          await GFWListManager.copyGFWLocationsToList(
            req,
            src_list,
            dest_list,
            src_location_ids,
            dest_location_ids
          );
        }

        res.send(saveAsDraftListConfig.success);
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(saveAsDraftListConfig.failed);
      });
  });

  app.post('/locations/rerunExistingList', (req, res) => {
    console.log('POST /locations/rerunExistingList');

    ListManager.rerunExistingList(req)
      .then(() => {
        res.send({ redirect: '/locations' });
      })
      .catch((err) => {
        console.log('Error sending list for rerun');
        ListManager.setListUnlocked(req, req.body.list_id);
        res.send(err);
      });
  });

  app.post('/locations/updateExistingList', (req, res) => {
    console.log('POST /locations/updateExistingList');
    const {
      list_id,
      table_name,
      geojson,
      gfw_list_id,
      selected_location_ids: src_location_ids,
      list_analysis_table_name,
      original_gfw_list,
      list_status_id,
      attributes,
    } = req.body;

    // 1. Change list status
    ListManager.resetListStatus(req, list_id, gfw_list_id, list_status_id)
      .then(() => {
        // 2. Upload location's to Existing List
        return ListManager.uploadToExistingList(req, list_id, table_name, geojson, attributes);
      })
      .then(async (resultGeoJSON) => {
        if (original_gfw_list) {
          // Copy GFW Locations to another list
          const src_list = await GFWListManager.getGFWListSchema(req, gfw_list_id);
          const dest_list = await ListManager.getListByListName(req, table_name);
          const dest_location_ids = resultGeoJSON.features.map(
            (feature) => feature.properties.location_id
          );
          dest_location_ids.sort((a, b) => a - b);
          await GFWListManager.copyGFWLocationsToList(
            req,
            src_list,
            dest_list,
            src_location_ids,
            dest_location_ids
          );
        }

        if (!original_gfw_list && list_status_id === listStatus.Draft) {
          // 3.a Set newly added location's status to Draft if user selected Save As Draft button
          const locationsIDs = getLocationIdsFromGeoJSON(resultGeoJSON);
          await ListManager.updateIndividualLocationsStatusID(
            req,
            list_analysis_table_name,
            locationsIDs,
            listStatus.Draft
          );

          await ListManager.setListStatus(req, list_id, listStatus.Draft);
        }

        if (list_status_id === listStatus.Pending) {
          // 3.b Run analysis on the updated list
          await AnalysisManager.requestAnalysis(req, table_name);
        }

        // Respond to client
        res.send('LocationAppended');
      })
      .catch((err) => {
        console.log('Error /locations/updateExistingList', err);
        // Set the list back to being active
        ListManager.setListStatus(req, list_id, listStatus.Active);
        ListManager.setListUnlocked(req, list_id);
        res.send('Location add failed');
      });
  });

  app.post('/locations/lockList', (req, res) => {
    console.log('POST /locations/lockList');
    const { list_id } = req.body;
    ListManager.getListLockStatus(req, list_id)
      .then((record) => {
        return ListManager.checkListLockStatus(req, list_id, record);
      })
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(err);
      });
  });

  app.post('/locations/unlockList', (req, res) => {
    console.log('POST /locations/unlockList');

    const { list_id } = req.body;
    ListManager.getListLockStatus(req, list_id)
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        ListManager.setListUnlocked(req, list_id)
          .then(() => {
            res.send({ isLocked: lock_status, lock_user_id });
          })
          .catch(() => {
            res.send({ error: true });
          });
      })
      .catch(() => {
        res.send({ error: true });
      });
  });

  app.post('/locations/editLocations', (req, res) => {
    logger.info('POST /locations/editLocations');
    const { list_id, attributes, activeTemplate } = req.body;
    let { location_ids } = req.body;

    // When there is no location_ids, it means that the update is done by CSV file
    if (!location_ids) {
      // Check if all locations list IDs belong to the same list
      const listIDs = _.uniq(
        attributes.map((location) => {
          return location.list_id;
        })
      );

      const attributesListID = Number(listIDs[0]);
      if (listIDs.length > 1 || attributesListID !== list_id) {
        res.status(422).send({
          message: `List ID [${listIDs.toString()}] in locations attributes does not match List ID [${list_id}] of list being selected for editing`,
          success: false,
        });

        return;
      }

      // Check if number of locations_ids are matching number of locations in the list
      const locationIDs = attributes.map((location) => {
        return location.location_id;
      });

      location_ids = _.compact(locationIDs);

      if (location_ids.length !== attributes.length) {
        res.status(422).send({
          message: 'Length of arguments and Location IDs do not match',
          success: false,
        });

        return;
      }
    }

    const errorList = validateAttributes(attributes, activeTemplate);
    if (errorList.length > 0) {
      res.status(422).send({
        message: errorList.join(', '),
        success: false,
      });
      return;
    }

    if (list_id && attributes) {
      controller
        .handleEditLocations(req, list_id, location_ids, attributes)
        .then((response) => {
          const { error, locationsEditedMessageFailed, locationsEditedMessageSuccessfully } =
            response;
          if (error) {
            logger.error(locationsEditedMessageFailed);
            logger.error(error);
            res.status(422).send({
              message: locationsEditedMessageFailed,
              success: false,
              error,
            });
          } else {
            res.status(200).send({
              message: locationsEditedMessageSuccessfully,
              success: true,
            });
          }
        })
        .catch(({ error, locationsEditedMessageFailed }) => {
          res.status(422).send({
            message: locationsEditedMessageFailed,
            success: false,
            error,
          });
        });
    } else {
      res.send({
        message: 'Missing required parameters',
        success: false,
      });
    }
  });

  app.post('/locations/deleteLocations', (req, res) => {
    console.log('POST /locations/deleteLocations');
    const { list_id, location_ids, gfw_list_id } = req.body;

    ListManager.deleteLocations(req, list_id, location_ids, gfw_list_id)
      .then(() => {
        return ListManager.deleteListIfEmpty(req, list_id);
      })
      .then((isListEmpty) => {
        const result = isListEmpty ? 'AllLocationsDeleted' : 'LocationDeleted';
        res.send(result);
      })
      .catch((err) => {
        console.log('Error /locations/deleteLocations', err);
        ListManager.setListUnlocked(req, list_id);
        res.send(err);
      });
  });

  app.post('/locations/deleteList', (req, res) => {
    console.log('POST /locations/deleteList');
    const { list_id } = req.body;

    ListManager.deleteList(req, list_id)
      .then(async () => {
        await removeExistingVectorTileFromS3(req, list_id);
        res.send('ListDeleted');
      })
      .catch((err) => {
        console.log('Error /locations/deleteList', err);
        ListManager.setListUnlocked(req, list_id);
        res.send(err);
      });
  });

  app.post('/locations/copyLocations', (req, res) => {
    console.log('POST /locations/copyLocations');
    const { src_list_id, src_location_ids, dest_list_id, geojson, gfw_list_id } = req.body;

    ListManager.copyLocations(
      req,
      src_list_id,
      src_location_ids,
      dest_list_id,
      geojson,
      gfw_list_id
    )
      .then(async () => {
        res.send('LocationsCopied');
      })
      .catch((err) => {
        console.log('Error /locations/copyLocations', err);
        ListManager.setListUnlocked(req, src_list_id);
        res.send(err);
      });
  });

  app.get('/locations/copyLocationsByQuery', (req, res) => {
    console.log('POST /locations/copyLocationsByQuery');
    // const { src_list_id, src_location_ids, dest_list_id, geojson, gfw_list_id } = req.body;
    const { src_list_id, src_location_ids, dest_list_id, geojson, gfw_list_id } = req.query;

    ListManager.copyLocations(
      req,
      src_list_id,
      src_location_ids,
      dest_list_id,
      geojson,
      gfw_list_id
    )
      .then(() => {
        res.send('LocationsCopied');
      })
      .catch((err) => {
        console.log('Error /locations/copyLocations', err);
        ListManager.setListUnlocked(req, src_list_id);
        res.send(err);
      });
  });

  app.post('/locations/getUserListLocationSpatialData', (req, res) => {
    console.log('POST /locations/getUserListLocationSpatialData');
    const { list_ids, location_id, rowsRequested } = req.body;
    const parsed_ids = list_ids.map((id) => parseInt(id, 10));
    const promises = parsed_ids.map((id) =>
      ListManager.getListLocations(req, id, location_id, rowsRequested)
    );
    Promise.all(promises)
      .then((listData) => {
        res.send(listData);
      })
      .catch((error) => {
        console.log('Error /locations/getUserListLocationSpatialData', error);
        res.send({
          errorCode: error.errorCode,
          message: 'Getting list data failed!',
        });
      });
  });

  app.post('/locations/getSimplifiedUserListLocationSpatialData', (req, res) => {
    console.log('POST /locations/getSimplifiedUserListLocationSpatialData');
    const { list_ids } = req.body;
    const parsed_ids = list_ids.map((id) => parseInt(id, 10));
    const promises = parsed_ids.map((id) => ListManager.getSimplifiedListLocations(req, id));
    Promise.all(promises)
      .then((listData) => {
        res.send(listData);
      })
      .catch((error) => {
        console.log('Error /locations/getSimplifiedUserListLocationSpatialData', error);
        res.send({
          errorCode: error.errorCode,
          message: 'Getting list data failed!',
        });
      });
  });

  app.post('/locations/getGFWListLocationSpatialData', (req, res) => {
    console.log('POST /locations/getGFWListLocationSpatialData');
    const { list_ids } = req.body;
    const parsed_ids = list_ids.split(',').map((id) => parseInt(id, 10));
    const promises = parsed_ids.map((id) => GFWListManager.getGFWListLocations(req, id));
    Promise.all(promises)
      .then((listData) => {
        res.send(listData);
      })
      .catch((error) => {
        console.log('Error /locations/getGFWListLocationSpatialData', error);
        res.send({
          errorCode: error.errorCode,
          message: 'Getting list data failed!',
        });
      });
  });

  // Deprecated
  app.post('/locations/getLists', async (req, res) => {
    console.log('POST /locations/getLists');
    const { list_ids } = req.body;
    const list_id = list_ids[0];

    try {
      const listAnalyses = await AnalysisManager.getListAnalyses(req, list_id);
      const locationAttributeArray = await ListManager.getListLocationsNoGeom(req, list_id);
      const locationAttributeList = await LocationManager.getLocationAttributesList(
        req,
        locationAttributeArray,
        false
      );
      const locationAnalysisArray = await AnalysisManager.getAnalysisDataForUserList(req, list_id);

      res.send({
        list_analysis: listAnalyses,
        location_analyses: [locationAttributeList, locationAnalysisArray],
      });
    } catch (err) {
      console.log('Failed', err);
      res.send(false);
    }
  });

  app.get('/locations/getListsPaginated', async (req, res) => {
    console.log('GET /locations/getListsPaginated');
    const {
      listID,
      page,
      pageSize,
      order: orderType,
      sortByAttribute,
      searchString,
      country,
      state,
      subState,
      hasError: hasErrorParam,
      analysisAreaMin,
      analysisAreaMax,

      // commodity risk filters:
      selectedSupplier,
      selectedSecondSupplier,
      selectedParentCompany,
      showRSPOCertified,
      selectedOverallThreats: overallThreats,
      selectedOverallValues: overallValues,
      selectedMillPriority: millPriority,
      analysisId = 'FCD',
      areAllAnalysesDraft,
    } = req.query;
    const hasError = hasErrorParam === 'true';

    const VALID_ANALYSIS_TYPES = ['FCD', 'ALERTS', 'AFI'];
    // Verify if analysisId is a valid analysis type
    if (!VALID_ANALYSIS_TYPES.includes(analysisId.toUpperCase())) {
      return res.status(400).send({
        message:
          'Invalid analysisId, analysisId should be one of the following: FCD, Alerts or AFI',
      });
    }
    const selectedOverallThreats = mapCommodityRiskValuesToDatabaseValues(overallThreats);
    const selectedOverallValues = mapCommodityRiskValuesToDatabaseValues(overallValues);
    const selectedMillPriority = mapCommodityRiskValuesToDatabaseValues(millPriority);

    const filters = {
      page,
      pageSize,
      orderType,
      sortByAttribute,
      searchString,
      country,
      state,
      subState,
      hasError,
      analysisAreaMin,
      analysisAreaMax,
      // commodity risk filters:
      selectedSupplier,
      selectedSecondSupplier,
      selectedParentCompany,
      showRSPOCertified,
      selectedOverallThreats,
      selectedOverallValues,
      selectedMillPriority,
    };
    const areAllAnalysesDraftBoolean = areAllAnalysesDraft === 'true';
    try {
      let listAnalyses;
      let locationAttributeArray = {};
      let numberOfPages = 0,
        numberOfResults = 0,
        maximumAnalysisAreaInTheList = 0,
        locationAttributeList;
      let location_analyses = [];

      if (areAllAnalysesDraftBoolean) {
        const analysisManagerResult = await AnalysisManager.getDraftListLocationData(
          listID,
          page,
          pageSize,
          req.session.organization_database,
          filters
        );

        listAnalyses = analysisManagerResult.listAnalyses;
        numberOfResults = analysisManagerResult.numberOfResults;
        numberOfPages =
          numberOfResults % pageSize === 0
            ? numberOfResults / pageSize
            : Math.floor(numberOfResults / pageSize) + 1;

        if (listAnalyses.length > 0) {
          location_analyses = listAnalyses;
        }
      } else {
        switch (analysisId.toUpperCase()) {
          case 'AFI': {
            const analysisManagerResult = await AnalysisManager.getAFIListAnalyses(
              listID,
              page,
              pageSize,
              req.session.organization_database,
              filters
            );

            listAnalyses = analysisManagerResult.listAnalyses;
            numberOfResults = analysisManagerResult.numberOfResults;
            numberOfPages =
              numberOfResults % pageSize === 0
                ? numberOfResults / pageSize
                : Math.floor(numberOfResults / pageSize) + 1;

            if (listAnalyses.length > 0) {
              location_analyses = listAnalyses;
            }
            break;
          }
          case 'ALERTS': {
            // this code is currently not being reached, until we add an Alerts tab to /list-details
            const analysisManagerResult = await AnalysisManager.getDashboardDataPaginatedByList(
              listID,
              page,
              pageSize,
              req.session.organization_database,
              filters
            );
            listAnalyses = analysisManagerResult.listDashboardAnalyses;
            numberOfResults = analysisManagerResult.numberOfResults.quantity;
            numberOfPages = analysisManagerResult.numberOfPages;
            maximumAnalysisAreaInTheList = 0;
            if (listAnalyses.length > 0) {
              location_analyses = listAnalyses.filter((analysis) => analysis.location_id > 1);
            }
            break;
          }
          default:
          case 'FCD': {
            listAnalyses = await AnalysisManager.getListAnalyses(req, listID);
            locationAttributeArray = await ListManager.getPaginatedAnalysisDataForUserList(
              req,
              listID,
              filters
            );
            const listManagerResult = await ListManager.getNumberPagesForAnalysisDataUserList(
              req,
              listID,
              filters
            );
            numberOfPages = listManagerResult.numberOfPages;
            numberOfResults = listManagerResult.numberOfResults;
            maximumAnalysisAreaInTheList = listManagerResult.maximumAnalysisAreaInTheList;

            break;
          }
        }
      }
      if (locationAttributeArray?.length > 0) {
        locationAttributeList = await LocationManager.getLocationAttributesList(
          req,
          locationAttributeArray,
          false
        );

        res.send({
          list_analysis: listAnalyses,
          location_analyses: locationAttributeList,
          numberOfPages,
          numberOfResults,
          maximumAnalysisAreaInTheList,
        });
      } else {
        res.send({
          list_analysis: listAnalyses,
          location_analyses,
          numberOfPages,
          numberOfResults,
          maximumAnalysisAreaInTheList,
        });
      }
    } catch (err) {
      console.log('Failed', err);
      res.status(err.status || 500).send({ msg: err.message });
    }
  });

  app.post('/locations/downloadingSelectedLocations', controller.downloadingSelectedLocations);

  app.post(
    '/locations/downloadingSelectedLocations/json',
    controller.downloadingSelectedLocationsJson
  );

  // ********************************************************************************************************************
  // New method to delete locations from filtered list
  // Needs the following parameters: listID, gfw_list_id, country, state, subState, analysisArea, analysisAreaOperator
  // in get request
  // ********************************************************************************************************************
  app.get('/locations/deleteAllFilteredLocations', (req, res) => {
    console.log('GET /locations/deleteAllFilteredLocations');
    const {
      listID,
      gfw_list_id,
      country,
      state,
      subState,
      selectedAreaMin,
      selectedAreaMax,
      searchString,
    } = req.query;
    const filters = { country, state, subState, selectedAreaMin, selectedAreaMax, searchString };

    ListManager.deleteFilteredLocations(req, listID, filters, gfw_list_id)
      .then(() => {
        return ListManager.deleteListIfEmpty(req, listID);
      })
      .then((isListEmpty) => {
        const result = isListEmpty ? 'AllLocationsDeleted' : 'LocationDeleted';
        res.send(result);
      })
      .catch((err) => {
        console.log('Error /locations/deleteFilteredLocations', err);
        ListManager.setListUnlocked(req, listID);
        res.send(err);
      });
  });

  app.post('/locations/getGFWListLocationData', (req, res) => {
    console.log('POST /locations/getGFWListLocationData');
    const { list_id, pageNum, pageSize, filters, filterString, tableSortedBy, tableSortedDesc } =
      req.body;
    const listAnalyses = [];
    const locationAttributeArray = [];
    const locationAnalysisArray = [];

    const selectedOverallThreats = mapCommodityRiskValuesToDatabaseValues(
      filters.selectedOverallThreats
    );
    const selectedOverallValues = mapCommodityRiskValuesToDatabaseValues(
      filters.selectedOverallValues
    );
    const selectedMillPriority = mapCommodityRiskValuesToDatabaseValues(
      filters.selectedMillPriority
    );

    const filtersWithDatabaseValues = {
      ...filters,
      selectedOverallThreats,
      selectedOverallValues,
      selectedMillPriority,
    };

    GFWListManager.getPaginatedTable(
      req,
      pageNum,
      pageSize,
      list_id,
      filtersWithDatabaseValues,
      filterString,
      tableSortedBy,
      tableSortedDesc
    )
      .then((response) => {
        const [noGeomData, gfwListAnalysesData, gfwLocationsAnalysesData, count] = response;
        locationAttributeArray.push(...noGeomData);
        locationAnalysisArray.push(...gfwLocationsAnalysesData);
        listAnalyses.push(...gfwListAnalysesData);
        if (noGeomData.length === 0) {
          return res.send({
            list_analysis: [],
            location_analyses: [],
            numberOfResults: 0,
          });
        }
        const numberOfPages =
          count % pageSize === 0 ? count / pageSize : Math.floor(count / pageSize) + 1;
        LocationManager.getLocationAttributesList(req, locationAttributeArray, true)
          .then((locationAttributeList) => {
            return res.send({
              list_analysis: listAnalyses,
              location_analyses: [locationAttributeList, locationAnalysisArray],
              numberOfResults: count,
              numberOfPages,
            });
          })
          .catch((err) => {
            console.log('Error /locations/getGFWListLocationData', err);
            res.status(err.status || 500).send(err.message);
          });
      })
      .catch((err) => {
        console.log('Error /locations/getGFWListLocationData', err);
        res.status(err.status || 500).send(err.message);
      });
  });

  app.post('/locations/getGFWListLocationGeom', (req, res) => {
    logger.info('POST /locations/getGFWListLocationGeom');
    const { list_id, location_ids } = req.body;

    GFWListManager.getGFWListLocationsGeom(req, list_id, location_ids)
      .then((geojson) => {
        logger.info(`Returning Geom GFW List Location Data for List ID: ${list_id}`);
        res.send(geojson);
      })
      .catch((e) => {
        logger.error('Error /locations/getGFWListLocationGeom', e);
        res.send(false);
      });
  });

  app.post('/locations/getGFWListLocationNoGeom', (req, res) => {
    const { list_id, location_ids } = req.body;

    GFWListManager.getGFWListLocationsNoGeom(req, list_id, location_ids)
      .then((geojson) => {
        logger.info(`Returning NoGeom GFW List Location Data for List ID: ${list_id}`);
        res.send(geojson);
      })
      .catch((e) => {
        logger.error('Error - POST /locations/getGFWListLocationNoGeom', e);
        res.send(false);
      });
  });

  app.post('/locations/getAdministrativeAreasInfo', (req, res) => {
    console.log('POST /locations/getAdministrativeAreasInfo');
    GFWListManager.getAdministrativeAreasInfo(req)
      .then((recordset) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(recordset));
      })
      .catch((err) => {
        console.log('Error /locations/getAdministrativeAreasInfo', err);
        res.send(err);
      });
  });

  app.post('/locations/getProtectedAreasInfo', (req, res) => {
    console.log('POST /getProtectedAreasInfo');
    GFWListManager.getProtectedAreasInfo(req)
      .then((recordset) => {
        res.send(recordset);
      })
      .catch((err) => {
        console.log('Error /locations/getProtectedAreasInfo', err);
        res.send(err);
      });
  });

  app.post('/locations/getAdministrativeAreasData', async (req, res) => {
    console.log('POST /getAdministrativeAreasData');
    const { selectedCountry, selectedStates, selectedSubStates, hasError } = req.body.filters;
    const filters = {
      selectedCountry,
      selectedStates,
      selectedSubStates,
      hasError,
    };
    const {
      id: listID,
      pageNum,
      pageSize,
      tableSortedBy,
      tableSortedDesc,
      filterString,
    } = req.body;
    let listData = [],
      protectedLocationResult = [],
      count = 0,
      listDataSalted = [],
      numberOfPages;
    try {
      if (pageNum || pageSize) {
        const paginatedListResult =
          await AnalysisManager.getPaginatedAnalysisDataForAdministrativeAreas(
            listID,
            pageNum,
            pageSize,
            filters,
            filterString,
            tableSortedBy,
            tableSortedDesc
          );
        listData = paginatedListResult.listData;
        protectedLocationResult = paginatedListResult.protectedLocationResult;
        count = paginatedListResult.count;

        if (protectedLocationResult.length === 0) {
          return res.send({
            list_analysis: [],
            location_analyses: [],
            total_rows: 0,
          });
        }
        numberOfPages =
          count % pageSize === 0 ? count / pageSize : Math.floor(count / pageSize) + 1;
      } else {
        listData = await GFWListManager.getAdministrativeAreasData(req, filters);
      }
      listDataSalted = LocationManager.getLocationsAttributesSalted(listData);
      const locationIds = listDataSalted.map((l) => Number(l.location_id));
      protectedLocationResult = await AnalysisManager.getAnalysisDataForGFWList(
        req,
        listID,
        locationIds
      );

      res.send({
        list_analysis: [],
        location_analyses: [listDataSalted, protectedLocationResult],
        numberOfPages,
        numberOfResults: count,
      });
    } catch (error) {
      console.log('Error /getAdministrativeAreasData', error);
      res.status(error.status || 500).send(error.message);
    }
  });

  app.post('/locations/getProtectedAreasData', (req, res) => {
    console.log('POST /getProtectedAreasData');
    const {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedDesignation,
      selectedDesignationType,
      selectedIUCN,
    } = req.body.filters;

    const {
      id: listID,
      pageNum,
      pageSize,
      tableSortedBy,
      tableSortedDesc,
      filterString,
    } = req.body;
    const filters = {
      selectedCountry,
      selectedState,
      selectedSubState,
      selectedDesignation,
      selectedDesignationType,
      selectedIUCN,
    };

    if (pageNum || pageSize) {
      AnalysisManager.getPaginatedAnalysisDataForProtectedAreas(
        listID,
        pageNum,
        pageSize,
        filters,
        filterString,
        tableSortedBy,
        tableSortedDesc
      )
        .then((result) => {
          const { listData, protectedLocationResult, count } = result;
          if (protectedLocationResult.length === 0) {
            return res.send({
              list_analysis: [],
              location_analyses: [],
              total_rows: 0,
            });
          }
          const numberOfPages =
            count % pageSize === 0 ? count / pageSize : Math.floor(count / pageSize) + 1;
          const location_ids = protectedLocationResult.map((item) => item.location_id);
          AnalysisManager.getAnalysisDataForGFWList(req, listID, location_ids)
            .then((protectedLocationAnalysisResult) => {
              const listDataSalted = LocationManager.getLocationsAttributesSalted(listData);
              return res.send({
                list_analysis: [],
                location_analyses: [listDataSalted, protectedLocationAnalysisResult],
                numberOfPages,
                numberOfResults: count,
              });
            })
            .catch((err) => {
              console.log('Error /getProtectedAreasData', err);
              res.status(err.status || 500).send(err.message);
            });
        })
        .catch((err) => {
          console.log('Error /getProtectedAreasData', err);
          res.status(err.status || 500).send(err.message);
        });
    } else {
      AnalysisManager.getAnalysisDataForProtectedAreas(req, listID, filters)
        .then(({ listData, protectedLocationResult }) => {
          const listDataSalted = LocationManager.getLocationsAttributesSalted(listData);
          return res.send({
            list_analysis: [],
            location_analyses: [listDataSalted, protectedLocationResult],
          });
        })
        .catch((err) => {
          console.log('Error /getProtectedAreasData', err);
          res.send(err);
        });
    }
  });

  app.post('/locations/getGFWListLocationsGlobalId', (req, res) => {
    console.log('POST /locations/getGFWListLocationsGlobalId');
    const { list_id, global_ids } = req.body;
    GFWListManager.getGFWListLocationsGlobalId(req, list_id, JSON.parse(global_ids))
      .then((result) => {
        const { listData, analysisData } = result;
        res.send({
          list_analysis: [],
          location_analyses: [listData, analysisData],
        });
      })
      .catch((e) => {
        console.log('Error /locations/getGFWListLocationsGlobalId', e);
        res.send(e);
      });
  });

  app.get('/locations/downloadShape', (req, res) => {
    console.log('GET: /locations/downloadShape');
    const { list_id, list_name, locations_ids, isGFWList, includedColumns } = req.query;
    const isGFWListBoolean = JSON.parse(isGFWList); // Convert true/false string to Boolean value

    const locationIDsArray = locations_ids.split(',').map((id) => parseInt(id, 10));

    const outputFileName = 'list_shapefile';
    const outputFileFormat = 'shapefile';

    // Instantiating archive object that will contain files in ZIP archive file
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      res.status(500).send({ error: err.message });
    });

    // on stream closed we can end the request
    archive.on('end', () => {
      console.log('Downloading shapefile size %d bytes', archive.pointer());
    });

    // set the archive name
    res.attachment('shapefile.zip');

    // this is the streaming magic
    archive.pipe(res);

    if (isGFWListBoolean) {
      GFWListManager.getGFWListLocations(req, list_id)
        .then((listFeaturesGeojson) => {
          generateZipShapefile(
            listFeaturesGeojson,
            locationIDsArray,
            outputFileName,
            outputFileFormat,
            archive,
            includedColumns.split(','),
            list_name
          );
        })
        .catch((e) => {
          console.log(e);
          res.send(false);
        });
    } else {
      ListManager.getListLocations(req, list_id)
        .then((listFeaturesGeojson) => {
          generateZipShapefile(
            listFeaturesGeojson,
            locationIDsArray,
            outputFileName,
            outputFileFormat,
            archive,
            includedColumns.split(','),
            list_name
          );
        })
        .catch((e) => {
          console.log(e);
          res.send(false);
        });
    }
  });
  /**
   * @summary Get list of all users from internal shared DB table
   */
  app.post('/locations/shareList/getAllUsers', (req, res) => {
    shareManager
      .getAllUsersForSharedList(req, req.body.list_id)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

  /**
   * @summary Add user to internal shared DB table
   */
  app.post('/locations/shareList/addUser', (req, res) => {
    const { admin, user, list } = req.body;
    shareManager
      .shareInternalList(req, admin.id, user.user_id, list.id)
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListShared,
          `Admin ${admin.first_name} ${admin.last_name} Shared list ${list.list_name} with ${user.name}.`
        );
        res.send({ message: 'User Added to internal share table.' });
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

  /**
   * @summary Remove user from internal shared DB table
   */
  app.post('/locations/shareList/removeUser', (req, res) => {
    const { admin, user, list } = req.body;
    shareManager
      .deactivateShareInternalList(req, user.user_id, list.id)
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUnShared,
          `Admin ${admin.first_name} ${admin.last_name} UnShared list ${list.list_name} with ${user.name}.`
        );
        res.send({ message: 'User Removed from internal share table.' });
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

  /**
   * @summary Remove All Non Admin or List Owner users from internal shared DB table
   */
  app.post('/locations/shareList/removeAllUsersFromSharedList', (req, res) => {
    const { admin, users_id, users_name, list } = req.body;

    shareManager
      .deactivateAllShareInternalList(req, users_id, list.id)
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUnSharedWithAll,
          `Admin ${admin.first_name} ${admin.last_name} UnShared list ${list.list_name} with ${users_name}.`
        );
        res.send({ message: 'Users removed from internal shared table.' });
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });

  /**
   * @summary Get all data used to populate filters for specific list.
   */
  app.get('/locations/filters/:id', controller.listFilterValues);

  /**
   * Create presigned URL for S3 bucket
   * Send replaceFile tro true if you want to replace the file
   */
  app.post('/locations/create-presigned-url', (req, res) => {
    const { key, contentType, replaceFile } = req.body;
    const { LISTS_MICROSERVICE_URL } = process.env;
    axios
      .post(`${LISTS_MICROSERVICE_URL}/create-presigned-url`, {
        key,
        contentType,
        replaceFile,
      })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        logger.error(`Error ${LISTS_MICROSERVICE_URL}/create-presigned-url`, error);
        const errorParsed = errorUtils.errorHandler(error);
        res.send(errorParsed, errorParsed.status);
      });
  });

  /**
   * Allow download of file from S3 bucket
   */
  app.post('/locations/get-object-presigned-url', (req, res) => {
    const { key } = req.body;

    const { LISTS_MICROSERVICE_URL } = process.env;
    axios
      .post(`${LISTS_MICROSERVICE_URL}/get-object-presigned-url`, {
        key,
      })
      .then((response) => {
        res.send(response.data);
      })
      .catch((error) => {
        logger.error(`Error ${LISTS_MICROSERVICE_URL}/get-object-presigned-url`, error);
        const errorParsed = errorUtils.errorHandler(error);
        res.send(errorParsed, errorParsed.status);
      });
  });

  /**
   * Save list to being processed in database and queue for processing
   */
  app.post('/locations/create-large-list', (req, res) => {
    const { listName, analysisIds, saveAsDraft, commodity } = req.body;
    const userId = req.session.organization_user_id;
    const { LISTS_MICROSERVICE_URL } = process.env;
    axios
      .post(`${LISTS_MICROSERVICE_URL}/create-large-list`, {
        user_id: userId,
        list_name: listName,
        client_database: req.session.organization_database,
        organization_id: req.session.organization_id,
        analysisIds,
        saveAsDraft: saveAsDraft || false,
        commodity: commodity || 'Unknown',
      })
      .then((response) => {
        res.send({ user_id: userId, list_id: response.data.list_id });
      })
      .catch((err) => {
        logger.error(`Error ${LISTS_MICROSERVICE_URL}/create-large-list`, err);
        res.status(500).send(err);
      });
  });

  /**
   * Send request to S3 Endpoint to start list processing
   */
  app.post('/locations/process-list', async (req, res) => {
    try {
      const {
        list_id,
        path: pathLocal,
        template_type,
        startAnalysis,
        listName,
        saveAsDraft,
        commodity,
        analysisTypesParam,
      } = req.body;

      const {
        organization_user_id,
        organization_id,
        subscription_status_id,
        organization_database,
      } = req.session;

      const { LISTS_MICROSERVICE_URL } = process.env;

      let analysisTypes =
        analysisTypesParam ||
        extractAnalysisTypes(await getListAnalysisStatusByListId(organization_database, list_id));

      const payload = {
        organization_id,
        list_id,
        organization_database,
        subscription_status_id,
        list_name: listName,
        path: pathLocal,
        template_type,
        template_id: 13,
        user_id: organization_user_id,
        startAnalysis,
        analysisIds: Object.keys(analysisTypes),
        saveAsDraft,
        commodity,
      };

      const response = await axios.post(`${LISTS_MICROSERVICE_URL}/process-list`, payload);
      logger.info('ProcessList LP response.data', response.data);

      if (saveAsDraft) {
        return res.send({});
      }

      const emailResponse = await AWSSES.sendEmail__ListSubmittedForAnalysis(
        req,
        listName,
        analysisTypes
      );
      logger.info('ProcessList SES response', emailResponse);

      res.send(emailResponse);
    } catch (error) {
      await controller.handleListProcessingError(
        error,
        req,
        res,
        req.body.listName,
        'Error /locations/process-list',
        `${process.env.LISTS_MICROSERVICE_URL}/process-list`,
        config
      );
    }
  });

  /**
   * Store details for file and S3 location
   */
  app.post('/locations/save-list-to-process', (req, res) => {
    const { list_id, key, listName } = req.body;
    const { organization_user_id } = req.session;

    const { LISTS_MICROSERVICE_URL } = process.env;

    axios
      .post(`${LISTS_MICROSERVICE_URL}/save-list-to-process`, {
        userId: organization_user_id,
        list_id,
        key,
        listName,
        client_database: req.session.organization_database,
      })
      .then((response) => {
        logger.info('SaveListToPrcess LP response.data', response.data);
        res.send(response.data);
      })
      .catch((err) => {
        logger.info(`Error ${LISTS_MICROSERVICE_URL}/save-list-to-process`, err);
        res.status(500).send(err);
      });
  });

  /**
   * @summary Get filtered data and return csv
   */
  app.get('/locations/csv/:id', controller.generateCSV);

  /**
   * @summary Get filtered data and return csv
   */
  app.get('/locations/shapefile/:id', controller.generateShapefile);
  /**
   * Consuming microservices
   */

  /**
   * @summary Get list location Geojson
   */
  app.post('/locations/getListLocationGeometry', controller.getListLocationGeometry);

  /**
   * @summary Download Error File
   */
  app.get('/locations/downloadErrorFile', controller.downloadErrorFile);

  /**
   * Start list copy or move operation
   */
  app.post('/locations/cm-large-list', (req, res) => {
    logger.info('POST /locations/cm-large-list');
    const { listType, targetList, listId } = req.body;
    let { listName, saveAsDraft } = req.body;

    const { organization_user_id, organization_id, organization_database, subscription_status_id } =
      req.session;
    logger.info(
      'copyOrMove request: ',
      req.body.listId,
      req.body.action,
      req.body.listType,
      req.body.targetList
    );

    const copyOrMoveRequestBody = {
      ...req.body,
      userId: organization_user_id,
      clientDatabase: organization_database,
      organizationId: organization_id,
      subscriptionStatusId: subscription_status_id,
    };

    if (listType === 'existing') {
      listName = targetList.list_name;
    }
    getListAnalysisStatusByListId(organization_database, listId)
      .then((listAnalysisStatusData) => {
        const analysisTypes = extractAnalysisTypes(listAnalysisStatusData);
        const { LISTS_MICROSERVICE_URL } = process.env;

        axios
          .post(`${LISTS_MICROSERVICE_URL}/CopyOrMoveLargeList`, copyOrMoveRequestBody)
          .then((response) => {
            if (saveAsDraft) {
              return res.send(response.data);
            }

            // Send email to user that list is submitted to be analysed
            return AWSSES.sendEmail__ListSubmittedForAnalysis(req, listName, analysisTypes)
              .then(() => {
                res.send(response.data);
              })
              .catch((err) => {
                logger.error(`Error sendEmail__ListSubmittedForAnalysis`, err);
              });
          })
          .catch(async (error) => {
            await controller.handleListProcessingError(
              error,
              req,
              res,
              listName,
              'Error /locations/cm-large-list',
              `${LISTS_MICROSERVICE_URL}/CopyOrMoveLargeList`,
              config
            );
          });
      })
      .catch((err) => {
        logger.error('Error: getListAnalysisStatusByListId', err);
        res.status(500).send(err);
      });
  });

  app.get(['/locations/upload-location', '/locations/upload-location/*'], (_, res) => {
    res.redirect('/locations?redirectTo=upload-location');
  });

  app.get('/locations/*', (_, res) => {
    res.redirect('/locations');
  });
};
