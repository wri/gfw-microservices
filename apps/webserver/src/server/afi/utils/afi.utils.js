import path from 'path';
const tmp = require('tmp');
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));
const { SQS } = require('@aws-sdk/client-sqs');

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

  const tmpPath = tmp.tmpNameSync();
  const fileName = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

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
  const sqs = new SQS({});
  const { message, key } = buildSQSMessage(request);

  const sqsSendMessageResponse = await sqs.sendMessage(message);
  sqsSendMessageResponse.key = key;
  return sqsSendMessageResponse;
};

module.exports = {
  sendMessageToQueue,
  buildSQSMessage,
};
