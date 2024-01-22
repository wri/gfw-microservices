const AWS = require('aws-sdk');

import buildAfiMessage from './afi.message';
import buildListMessage from './list.message';
import buildAlertsMessage from './alerts.message';

const buildMessageMethods = {
  afi: buildAfiMessage,
  list: buildListMessage,
  alerts: buildAlertsMessage,
};

const sendMessageToQueue = async (request, source) => {
  const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  };
  AWS.config.update(awsConfig);
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

  const { message, key } = buildMessageMethods[source](request);
  console.log(message);

  const sendSqsMessage = await sqs.sendMessage(message).promise();
  sendSqsMessage.key = key;
  return sendSqsMessage;
};

export { sendMessageToQueue };
