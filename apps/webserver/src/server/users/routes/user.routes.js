const controller = require('../controllers/user.controller');
// const path = require('path');
// const utils = require(path.resolve('./config/publicutils/route.utils'));

/**
* @name exports
* @static
* @summary Routes for working with user auth and sessions
*/
module.exports = app => {

  /**
  * @name /auth/signout
  * @see user.controller
  * @memberof Router
  */
  app.route('/auth/signout').get(controller.signout);

  /**
  * @name /auth/signin
  * @see user.controller
  * @memberof Router
  */
  app.route('/auth/signin').post(controller.signin);

  /**
  * @name /auth/signup
  * @see user.controller
  * @memberof Router
  */
  app.route('/auth/signup').post(controller.signup);

  /**
  * @name /auth/forgot
  * @see user.controller
  * @memberof Router
  */
  app.route('/auth/forgot').post(controller.forgot);

};
