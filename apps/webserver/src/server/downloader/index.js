import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import buildAfiMessage from './afi.message';
import buildListMessage from './list.message';
import buildAlertsMessage from './alerts.message';

const buildMessageMethods = {
  afi: buildAfiMessage,
  list: buildListMessage,
  alerts: buildAlertsMessage,
};

const sendMessageToQueue = async (request, source) => {
  const sqsClient = new SQSClient();

  const { message, key } = buildMessageMethods[source](request);

  const command = new SendMessageCommand(message);
  const response = await sqsClient.send(command);

  return { key, response };
};

export { sendMessageToQueue };
