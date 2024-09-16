import config from '../../../config/config';
const { compiledAssets } = config;
import * as logger from '../../../config/privateutils/logger.utils';

/**
 * @function verify
 * @summary
 * @name exports.verify
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
export const verify = (req, res) => {
  // Set in the response to not cache the page
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  const { session } = req;
  if (session.ispromanager && session.verified_promanager) {
    logger.info('Is Verified Pro Manager');
    res.redirect('/pro-manager-list');
  } else if (session.organization_database) {
    logger.info('Has Organization Database');
    res.redirect('/locations');
  } else {
    res.render('verify', {
      common: compiledAssets.js.common,
      verifyjs: compiledAssets.js.verify,
      verifycss: compiledAssets.css.verify,
    });
  }
};
