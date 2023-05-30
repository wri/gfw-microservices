const path = require('path');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));

/**
 * @name exports
 * @static
 * @summary Checks user inactivity and logs them out accordingly
 */
module.exports = (app) => {
  const routeMiddlewares = [middlewares.checkInactivity];

  app.use('/session', routeMiddlewares);

  app.post('/session', (req, res) => {
    res.send({});
  });
};
