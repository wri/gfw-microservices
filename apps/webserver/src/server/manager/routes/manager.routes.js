const controller = require('../controllers/manager.controller');

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app) => {
  /**
   * @name /manager
   * @see manager.controller
   * @memberof Router
   */
  app.get('/pro-manager', controller.manager);
};
