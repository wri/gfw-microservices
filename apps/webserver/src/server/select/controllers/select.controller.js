const path = require('path');
import config from '../../../config/config';
const { compiledAssets } = config;
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
/**
 * @function select
 * @summary
 * @name exports.select
 * @static
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const select = (req, res) => {
  // Set in the response to not cache the page
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  const { session } = req;
  if (session.hasOwnProperty('organization_database') && session.organization_database) {
    console.log('SELECT: has Organization Database');
    res.redirect('/locations');
  } else {
    AuthManager.getOrganizations(req)
      .then((orgs) => {
        res.render('select', {
          organizations: orgs,
          common: compiledAssets.js.common,
          selectjs: compiledAssets.js.select,
          selectcss: compiledAssets.css.select,
        });
      })
      .catch((err) => {
        console.log('Reject', err);
      });
  }
};
