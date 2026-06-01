import { SQSClient } from '@aws-sdk/client-sqs';
import { Consumer } from 'sqs-consumer';

const logger = require('../../../config/privateutils/logger.utils');
const tileSqsUrls = require('../config/vectorTilesSqs.config');
const { generateAndStoreVectorTiles } = require('./vectorTileGenerate.utils');

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

const sqsClient = new SQSClient(awsConfig);

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
      return tileSqsUrls.VECTOR_TILE_SQS__PRODV2;
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
    sqs: sqsClient,
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

export { initialize };
