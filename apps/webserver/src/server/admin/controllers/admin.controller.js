const axios = require('axios');
const { compiledAssets } = require('../../../config/config');
const logger = require('../../../config/privateutils/logger.utils');

/**
 * @function admin
 * @summary
 * @name exports.admin
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
const admin = (req, res) => {
  res.render('admin', {
    common: compiledAssets.js.common,
    adminjs: compiledAssets.js.admin,
    admincss: compiledAssets.css.admin,
  });
};

// Get the latest commit for given service
const getCommitForSerivce = async (serviceUrl) => {
  if (!serviceUrl) {
    return 'N/A';
  }
  const latestUrl = `${serviceUrl}/latest_commit`;
  try {
    const response = await axios.get(latestUrl);
    return response.data || 'N/A';
  } catch (error) {
    logger.error('Error in getCommitForSerivce', latestUrl, error.stack);
    return 'N/A';
  }
};

// get all commits for all services
const getAllCommits = async () => ({
  WEB:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? 'dev'
      : process.env.LATEST_COMMIT,
  LD: await getCommitForSerivce(process.env.LIST_DOWNLOADER_URL),
  LP: await getCommitForSerivce(process.env.LISTS_MICROSERVICE_URL),
  EAPI: await getCommitForSerivce(process.env.EAPI_MICROSERVICE_URL),
});

// report all commits via express route
const latestCommit = async (req, res) => {
  res.send(await getAllCommits());
};

module.exports = {
  admin,
  latestCommit,
};
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    ...module.exports,
    getCommitForSerivce,
    getAllCommits,
  };
}
