const sql = require('mssql');
const path = require('path');
const logger = require('../../../config/privateutils/logger.utils');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const controller = require('../controllers/helpCenter.controller');
const { PRODUCTION_ENVIRONMENTS } = require('../../../config/config/environments.config');

const filterHelpCenterRequest = async (req, res, next) => {
  const { host } = req.headers;
  const { NODE_ENV } = process.env;
  const PARAM_ENVIRONMENT = PRODUCTION_ENVIRONMENTS.includes(NODE_ENV) ? 'production' : NODE_ENV;

  try {
    const params = [{ field: 'environment', type: sql.NVarChar, value: PARAM_ENVIRONMENT }];
    const allowedDomainsRecords = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetAllowedDomains',
      params
    );
    const allowedDomainNames = allowedDomainsRecords.map((record) => {
      return record.domain_name;
    });

    logger.info(`POST:/auth/helpCenter - Current NODE_ENV: ${NODE_ENV} - Request host: ${host}`);
    if (allowedDomainNames.includes(host)) {
      logger.info(`Request header: ${JSON.stringify(req.headers)}`);
      next();
    } else {
      logger.error(
        `Host NOT ALLOWED: ${host}: ${JSON.stringify(
          req.headers
        )}. Checked with "uspGetAllowedDomains" SP`
      );
      res.json({
        success: false,
        message: 'Not allowed',
      });
    }
  } catch (e) {
    logger.error(
      `Check DB and make sure AllowedDomains table and uspGetAllowedDomains store procedure are migrated. Error: ${JSON.stringify(
        e
      )}`
    );
    res.json({
      success: false,
      message: 'Check DB records',
    });
  }
};

module.exports = (app) => {
  app.post('/auth/helpCenter', filterHelpCenterRequest, controller.helpCenter);
};
