const path = require('path');
const axios = require('axios');

const controller = require('../controllers/map.controller');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

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

  /**
   * Get Planet mosaics Tiles Info
   */
  app.get('/map/getPlanetTilesInfo', (req, res) => {
    const url = `https://api.planet.com/basemaps/v1/mosaics?api_key=${process.env.PLANET_TILES_API_KEY}`;
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
        console.log('getPlanetTile Error:', error);
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
        console.log('Reject', error);
        res.send({
          errorCode: error.errorCode,
          message: 'Getting list data failed!',
        });
      });
  });
};
