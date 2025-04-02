const path = require('path');
import axios from 'axios';

const controller = require('../controllers/map.controller');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
import * as logger from '../../../config/privateutils/logger.utils';
import querystring from 'querystring';

/**
 * @name exports
 * @static
 * @summary Map page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /map
   * @see map.controller
   * @memberof Router
   */

  // All methods must under /map must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/map', routeMiddlewares);

  app.get('/map', controller.map);

  app.post('/map', controller.map);

  // Routes for APIMap

  app.use('/apimap', routeMiddlewares);

  app.get('/apimap', controller.map);

  app.post('/apimap', controller.map);

  /**
   * Get Planet mosaics Tiles Info
   */
  app.get('/map/getPlanetTilesInfo', (req, res) => {
    const url = `https://api.planet.com/basemaps/v1/mosaics?api_key=${process.env.PLANET_TILES_API_KEY}&_page_size=1000`;
    axios
      .get(url)
      .then((results) => {
        res.set('Cache-control', results.headers['cache-control']);
        res.contentType(results.headers['content-type']);
        res.send(results.data);
      })
      .catch((error) => {
        console.log('getPlanetTilesInfo Error:', error);
        res.send({ message: '/map/getPlanetTilesInfo failed' });
      });
  });

  /**
   * Get selected Planet Tile
   * In this case everything from path after `/map/getPlanetTile/` to get specific tile
   */
  app.get('/map/getPlanetTile/*', (req, res) => {
    const tile = req.params[0];
    const { proc = '' } = req.query;
    const url = `https://tiles.planet.com/${tile}?proc=${proc}&api_key=${process.env.PLANET_TILES_API_KEY}`;
    axios
      .get(url, { responseType: 'arraybuffer' })
      .then((results) => {
        res.set('Cache-control', results.headers['cache-control']);
        res.contentType(results.headers['content-type']);
        res.send(results.data);
      })
      .catch((error) => {
        logger.error(`POST /map/getPlanetTile/`, {
          params: req.params,
          query: querystring.stringify(req.query),
          error: error.stack || error,
        });
        res.send({ message: '/map/getPlanetTile failed' });
      });
  });

  app.post('/map/getUserListLocationData-map', (req, res) => {
    let { list_ids } = req.body;
    list_ids = list_ids.split(',').map((id) => parseInt(id));
    const promises = [];
    list_ids.forEach((id) => {
      promises.push(ListManager.getListLocations(req, id));
    });
    Promise.all(promises)
      .then((listData) => {
        res.send(listData);
      })
      .catch((error) => {
        logger.error('POST /map/getUserListLocationData-map', error.stack || error);
        res.send({
          errorCode: error.errorCode,
          message: 'Getting list data failed!',
        });
      });
  });

  app.post('/map/getUserListFilteredLocationData', async (req, res) => {
    const { listId, filterByLocations } = req.body;

    try {
      const { features, ...restOfListData } = await ListManager.getListLocations(req, listId);
      const filteredLocations = features.filter((location) => {
        return filterByLocations.includes(location.properties.location_id);
      });

      res.send({
        ...restOfListData,
        features: filteredLocations,
      });
    } catch (error) {
      logger.error('POST /map/getUserListFilteredLocationData', error.stack || error);
      res.status(500).send({
        errorCode: error.errorCode,
        message: 'Getting list data failed!',
      });
    }
  });

  app.get('/map/gadm-admininstrative-boundaries', (req, res) => {
    const { query } = req;
    const { countryCode } = query;

    let sql;

    if (countryCode) {
      sql = `SELECT name_1, gid_1 FROM data WHERE adm_level='1' AND gid_0='${countryCode}' ORDER BY name_1`;
    } else {
      sql = `SELECT name_0, gid_0 as iso FROM data WHERE adm_level='0' AND name_0 IS NOT NULL ORDER BY name_0`;
    }

    fetch(
      'https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1.64/query/json',
      {
        method: 'POST',
        headers: {
          'x-api-key': process.env.GADM_ADMINISTRATIVE_BOUNDARIES_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        res.send(response);
      })
      .catch((error) => console.error('Error:', error));
  });
};
