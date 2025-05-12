/* eslint-disable import/no-dynamic-require */
const path = require('path');
const controller = require('../controllers/converters.controller');
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const middlewares = require(path.resolve('./config/publicutils/middlewares'));

/**
 * @name exports
 * @static
 * @summary Converters Routes
 */
module.exports = (app, limiter) => {
  /**
   * @route GET /converters
   * @desc Returns a list of available converters
   * @access Pro Manager only
   */
  app.get('/converter/all', middlewares.checkProManagerAuthentication, controller.getConverters);
};
