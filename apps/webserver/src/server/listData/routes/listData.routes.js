const middlewares = require('../../../config/publicutils/middlewares');
const rateLimiterUtil = require('../../../config/lib/limiter-util');
const express = require('express');
const controller = require('../controllers/listData.controller');
const { now } = require('lodash');

const listRoutes = express.Router();

module.exports = (app, limiter) => {
  /**
   * @name /listData
   * @see listData.controller
   * @memberof Router
   */

  // All methods under /locations must pass through middleware
  const routeMiddlewares = [
    middlewares.checkAuthentication,
    middlewares.checkOrganization,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  // Implement middlewares check
  app.use('/listData', routeMiddlewares);

  app.get('/listData', controller.listData);

  app.post('/listDataCustom', controller.listDataCustom);

  app.use('/api/list', [...routeMiddlewares, listRoutes]);

  //TODO implement list routes

  const baseData = {
    analysisId: 'FCD',
    status: 2,
    errorInfo: '',
    updateTime: '2021-06-01T10:00:00.000Z',
  };

  let analysis = [
    {
      ...baseData,
      listId: 5498,
    },
    {
      ...baseData,
      listId: 5498,
      analysisId: 'ALERTS',
    },
    {
      ...baseData,
      listId: 5440,
    },
    {
      ...baseData,
      listId: 5440,
      analysisId: 'ALERTS',
    },
    {
      ...baseData,
      listId: 5442,
    },
    {
      ...baseData,
      listId: 5442,
      analysisId: 'ALERTS',
    },
    {
      ...baseData,
      listId: 5445,
    },
    {
      ...baseData,
      listId: 5445,
      analysisId: 'ALERTS',
    },
  ];

  listRoutes.get('/:listId/analysis', (req, res) => {
    const { listId } = req.params;
    const result = analysis.filter((a) => a.listId === Number(listId));
    return res.status(200).send(result);
  });

  listRoutes.post('/:listId/analysis', (req, res) => {
    const { listId } = req.params;
    const { analysisIds } = req.body;

    const value = {
      statusId: 1,
      status: 'Pending',
      errorInfo: '',
      updateTime: now(),
      listId: Number(listId),
    };

    const listIds = analysis.map((a) => a.listId);
    if (!listIds.includes(Number(listId))) {
      analysisIds.forEach((analysisId) => {
        analysis.push({
          ...value,
          analysisId,
        });
      });
      return res.status(200).send();
    }

    analysis = analysis.reduce((acc, curr) => {
      if (curr.listId !== Number(listId)) {
        acc.push(curr);
        return acc;
      }
      if (analysisIds.includes(curr.analysisId)) {
        acc.push({
          ...curr,
          ...value,
        });
      }
      return acc;
    }, []);
    return res.status(200).send();
  });
};
