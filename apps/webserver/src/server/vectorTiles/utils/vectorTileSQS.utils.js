const path = require('path');
const AWS = require('@aws-sdk/client-sqs');
const { Consumer } = require('sqs-consumer');

const logger = require('../../../config/privateutils/logger.utils');
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
  const queueUrl = setVectorTileQueueUrl();
  logger.info('VECTOR TILE URL', queueUrl);
  const sqsListener = Consumer.create({
    queueUrl,
    attributeNames: ['ApproximateFirstReceiveTimestamp'],
    handleMessage: async (message) => {
      const messageBody = JSON.parse(message.Body);
      const { organization_database, organization_id, list_id } = messageBody;
      const messageTimestamp = parseInt(message.Attributes.ApproximateFirstReceiveTimestamp, 10);

      logger.info(
        'VECTOR TILE MESSAGE INFO',
        organization_database,
        organization_id,
        list_id,
        messageTimestamp
      );

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
    sqs: new AWS.SQS(),
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
