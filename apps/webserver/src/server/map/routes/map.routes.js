const path = require('path');
import axios from 'axios';
import { WDPA_PROTECTED_AREAS } from '../../../client/common/js/service/mapLayers.constants';

const controller = require('../controllers/map.controller');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
import * as logger from '../../../config/privateutils/logger.utils';
import querystring from 'querystring';

const WDPA_LICENSED_PROTECTED_AREAS_QUERY_URL = `https://data-api.globalforestwatch.org/dataset/wdpa_licensed_protected_areas/${WDPA_PROTECTED_AREAS}/query/json`;

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
        logger.error(`getPlanetTilesInfo Error`, {
          response: error.response ? error.response.data?.toString() : null,
          error: error.stack || error,
        });
        res
          .status(error.response?.status || 502)
          .send({ message: '/map/getPlanetTilesInfo failed' });
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
          response: error.response ? error.response.data?.toString() : null,
          error: error.stack || error,
        });
        res.status(error.response?.status || 502).send({ message: '/map/getPlanetTile failed' });
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
        res.status(500).send({
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

  app.get('/map/gadm-admininstrative-boundaries', async (req, res) => {
    try {
      const { countryCode, searchInput } = req.query;
      let sql;

      // Only allow uppercase A-Z letters and max 3 characters (ISO Alpha-3)
      const isValidISO = /^[A-Z]{2,3}$/.test(countryCode);
      if (searchInput) {
        sql = `SELECT
                adm_level, gfw_geojson,
                name_0, gid_0,
                name_1, gid_1,
                name_2, gid_2
              FROM data
              WHERE name_0_normalized ILIKE '%${searchInput}%'
                OR name_1_normalized ILIKE '%${searchInput}%'
                OR name_2_normalized ILIKE '%${searchInput}%'
              ORDER BY
                CASE adm_level
                  WHEN '0' THEN 0
                  WHEN '1' THEN 1
                  WHEN '2' THEN 2
                  ELSE 3
                END,
                name_1
              LIMIT 4;`;
      } else if (countryCode && isValidISO) {
        sql = `SELECT name_1, gid_1 FROM data WHERE adm_level='1' AND gid_0='${countryCode}' ORDER BY name_1`;
      } else if (!countryCode) {
        sql = `SELECT name_0, gid_0 FROM data WHERE adm_level='0' AND name_0 IS NOT NULL ORDER BY name_0`;
      } else {
        return res.status(400).json({ error: 'Invalid country code format' });
      }

      const response = await fetch(
        'https://data-api.globalforestwatch.org/dataset/gadm_administrative_boundaries/v4.1.85/query/json',
        {
          method: 'POST',
          headers: {
            'x-api-key': process.env.GFW_DATA_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      logger.error('GFW data-api query failed', error.stack || error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  });

  app.get('/map/landmark_indigenous_and_community_lands', async (req, res) => {
    try {
      const { searchInput } = req.query;

      if (!searchInput) {
        return res.status(400).json({ error: 'Invalid name format' });
      }
      const sql = `SELECT
                *
              FROM data
              WHERE name ILIKE '%${searchInput}%'
              LIMIT 4;`;

      const response = await fetch(
        'https://data-api.globalforestwatch.org/dataset/landmark_indigenous_and_community_lands/v202405/query/json',
        {
          method: 'POST',
          headers: {
            'x-api-key': process.env.GFW_DATA_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      logger.error('GFW data-api query failed', error.stack || error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  });

  app.get('/map/gfw_universal_mill_list', async (req, res) => {
    try {
      const { searchInput } = req.query;

      if (!searchInput) {
        return res.status(400).json({ error: 'Invalid name format' });
      }

      const sql = `SELECT * FROM data WHERE mill_name ILIKE '${searchInput}%' OR mill_name ILIKE '%${searchInput}%' LIMIT 4;`;

      const response = await fetch(
        'https://data-api.globalforestwatch.org/dataset/gfw_universal_mill_list/latest/query/json',
        {
          method: 'POST',
          headers: {
            'x-api-key': process.env.GFW_DATA_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      logger.error('GFW data-api query failed', error.stack || error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  });

  app.get('/map/wdpa_licensed_protected_areas', async (req, res) => {
    try {
      const { searchInput } = req.query;

      if (!searchInput) {
        return res.status(400).json({ error: 'Invalid name format' });
      }

      const sql = `SELECT * FROM data WHERE name ILIKE '%${searchInput}%' LIMIT 4;`;

      const response = await fetch(WDPA_LICENSED_PROTECTED_AREAS_QUERY_URL, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.GFW_DATA_API_KEY,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GFW_BEARER_TOKEN}`,
        },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      logger.error('GFW data-api query failed', error.stack || error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  });
};
