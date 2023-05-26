const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));

/**
 * @function verify
 * @summary
 * @name exports.verify
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.verify = (req, res) => {
  // Set in the response to not cache the page
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  const { session } = req;
  if (
    session.hasOwnProperty('verified_promanager') &&
    session.ispromanager &&
    session.verified_promanager
  ) {
    console.log('Is Verified Pro Manager');
    res.redirect('/pro-manager-list');
  } else if (session.hasOwnProperty('organization_database') && session.organization_database) {
    console.log('Has Organization Database');
    res.redirect('/locations');
  } else {
    res.render('verify', {
      common: compiledAssets.js.common,
      verifyjs: compiledAssets.js.verify,
      verifycss: compiledAssets.css.verify,
    });
  }
};
