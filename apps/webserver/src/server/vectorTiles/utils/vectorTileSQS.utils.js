/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable import/no-dynamic-require */

const path = require('path');
const AWS = require('aws-sdk');
const https = require('https');
const logger = require('../../../config/lib/winston');
const { Consumer } = require('sqs-consumer');
const tileSqsUrls = require(path.resolve('./server/vectorTiles/config/vectorTilesSqs.config'));
const { generateAndStoreVectorTiles } = require('./vectorTileGenerate.utils');

const setVectorTileQueueUrl = () => {
  // get vectorTile queue url from vectorTilesSqs config
  switch (process.env.NODE_ENV) {
    /* case 'development':
      return tileSqsUrls.VECTOR_TILE_SQS__DEVELOPMENT; */
    case 'qa':
      return tileSqsUrls.VECTOR_TILE_SQS__QA;
    case 'staging':
      return tileSqsUrls.VECTOR_TILE_SQS__STAGING;
    case 'production':
      return tileSqsUrls.VECTOR_TILE_SQS__PRODUCTION;
    default:
      return tileSqsUrls.VECTOR_TILE_SQS__LATEST;
  }
};

function initialize() {
  const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };

  AWS.config.update(awsConfig);

  const queueUrl = setVectorTileQueueUrl();
  logger.info('VECTOR TILE URL', queueUrl);
  const sqsListener = Consumer.create({
    queueUrl,
    attributeNames: ['ApproximateFirstReceiveTimestamp'],
    handleMessage: async (message) => {
      const messageBody = JSON.parse(message.Body);
      const { organization_database, organization_id, list_id } = messageBody;
      const messageTimestamp = parseInt(message.Attributes.ApproximateFirstReceiveTimestamp, 10);
      logger.info('VECTOR TILE MESSAGE INFO', organization_database, organization_id, list_id, messageTimestamp);
      const req = {
        messageTimestamp,
        session: {
          isNodeServer: true,
          organization_database,
          organization_id,
        },
      };
      generateAndStoreVectorTiles(req, list_id)
        .then((response) => {
          logger.info('SUCCESSFUL VECTOR TILE TRIGGER/GENERATION', response.message);
        })
        .catch((response) => {
          logger.error('VECTOR TILE GENERATION FAILED', response.message);
        });
    },
    sqs: new AWS.SQS({
      httpOptions: {
        agent: new https.Agent({
          keepAlive: true,
        }),
      },
    }),
    batchSize: 5,
  });
  sqsListener.on('error', (err) => {
    logger.error(err.message);
  });
  sqsListener.on('processing_error', (err) => {
    logger.error(err.message);
  });
  sqsListener.start();
}

module.exports = {
  initialize,
};
