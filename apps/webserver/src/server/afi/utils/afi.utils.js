import path from 'path';
const tmp = require('tmp');
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));
const AWS = require('aws-sdk');

/**
 * @function buildCsvFile
 * @function buildShapefile
 * @summary send message to sqs to  start background task to generate data file.
 * @name exports.buildCsvFile
 * @name exports.buildShapefile
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
const messageSQSTemplate = {
  list: {
    DataType: 'String',
    StringValue: '',
  },
  userEmail: {
    DataType: 'String',
    StringValue: '',
  },
  organizationDatabase: {
    DataType: 'String',
    StringValue: '',
  },
  file: {
    DataType: 'String',
    StringValue: '',
  },
  key: {
    DataType: 'String',
    StringValue: '',
  },
};

const buildSQSMessage = (request) => {
  const { listId } = request.query;
  const { user_email: userEmail, organization_database: organizationDatabase } = request.session;

  const tmpobj = tmp.fileSync();
  const fileName = tmpobj.name.replace('/tmp/', '');

  const filters = {
    userEmail,
    organizationDatabase,
    list: JSON.stringify({ listId }),
    file: JSON.stringify({ type: 'afi', key: fileName }),
  };

  const messageSQS = Object.keys(filters)
    .filter((key) => Object.keys(messageSQSTemplate).includes(key))
    .reduce((obj, key) => {
      obj[key] = { ...messageSQSTemplate[key], StringValue: filters[key] ?? '' };
      return obj;
    }, {});

  const sqsOrderData = {
    MessageAttributes: messageSQS,
    MessageBody: JSON.stringify(messageSQS),
    MessageDeduplicationId: sqsUtils.uniqueIdGenerator(),
    MessageGroupId: sqsUtils.uniqueIdGenerator(),
    QueueUrl: process.env.AWS_TMP_QUEUE,
  };

  return {
    message: sqsOrderData,
    key: fileName,
  };
};

const sendMessageToQueue = async (request) => {
  const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };
  AWS.config.update(awsConfig);
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

  const { message, key } = buildSQSMessage(request);

  const sendSqsMessage = await sqs.sendMessage(message).promise();
  sendSqsMessage.key = key;
  return sendSqsMessage;
};

module.exports = {
  sendMessageToQueue,
  buildSQSMessage,
};
