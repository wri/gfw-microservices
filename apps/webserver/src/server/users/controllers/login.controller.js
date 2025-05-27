const { renderToString } = require('react-dom/server');
const { createElement } = require('react');
import config from '../../../config/config';
const { compiledAssets } = config;
const logger = require('../../../config/privateutils/logger.utils');

/**
 * @function login
 * @summary render the login page
 * @name exports.login
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
let counter = 0;
let firstTime = true;
export const login = (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    counter++;
    if (firstTime) {
      setInterval(() => {
        // intended for checking ECS fargate health check (task-definition-web-prod.json)
        // https://gfw.atlassian.net/browse/GPV-4530
        logger.info('Per minute login counter', counter);
        counter = 0;
      }, 1000 * 60); // every minute
      firstTime = false;
    }
  }
  // Get the markup from our component
  const markup = compiledAssets.js['login-component']
    ? renderToString(createElement(compiledAssets.js['login-component'].default))
    : '';

  res.render('login', {
    critical: compiledAssets.css['login/css/login.scss'],
    common: compiledAssets.js.common,
    loginjs: compiledAssets.js.login,
    logincss: compiledAssets.css.login,
    markup: markup,
  });
};
