const path = require('path');
const express = require('express');
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const AWS = require('aws-sdk');

const eudrRoutes = express.Router();

/**
 * @name exports
 * @static
 * @summary eudr stub
 */
module.exports = (app, limiter) => {
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/api/eudr', [...routeMiddlewares, eudrRoutes]);

  eudrRoutes.get('/download', (req, res) => {
    const { listId } = req.query;

    if (!listId) {
      return res.status(400).send('Missing listId');
    }

    const fileKey = `s3://gfwpro-lpl-dev/19g61lhf2263y-ghana_64k_cocoa_generic.zip`;
    const basename = path.basename(fileKey);
    const bucket = path.parse(fileKey).dir.replace(/[sS]3:(\/)+/g, '');
    console.log('Trying to download file', fileKey);
    const s3 = new AWS.S3();
    const options = {
      Bucket: bucket,
      Key: basename,
    };

    res.attachment(fileKey);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=' + `${basename}.zip`);
    const fileStream = s3.getObject(options).createReadStream();
    fileStream.pipe(res);
  });

  eudrRoutes.put('/analysis', (req, res) => {
    const { analysisId, status, errorInfo, updateTime, listId } = req.body;

    const index = analysis.findIndex((a) => a.analysisId === analysisId && a.listId === listId);
    if (index === -1) {
      return res.status(400).send('Analysis does not exists');
    }

    const value = {
      analysisId,
      status,
      errorInfo,
      updateTime,
      listId,
    };
    analysis[index] = {
      ...analysis[index],
      ...value,
    };

    return res.status(200).send(analysis[index]);
  });

  eudrRoutes.post('/analysis', (req, res) => {
    const { analysisId, status, errorInfo, updateTime, listId } = req.body;

    const ifExists = analysis.find((a) => a.analysisId === analysisId && a.listId === listId);
    if (ifExists) {
      return res.status(400).send('Analysis already exists');
    }

    const value = {
      analysisId,
      status,
      errorInfo,
      updateTime,
      listId,
    };

    analysis.push(value);
    return res.status(201).send(value);
  });
};
