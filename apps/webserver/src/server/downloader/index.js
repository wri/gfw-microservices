import * as logger from '../../config/privateutils/logger.utils';
import buildAfiMessage from './afi.message';
import buildListMessage from './list.message';
import buildAlertsMessage from './alerts.message';
import buildAccountUsersUsageMessage from './account.users.usage.message';
import buildProManagerUsersMessage from './pro.manager.users.message';
import axios from 'axios';

const buildMessageMethods = {
  afi: buildAfiMessage,
  list: buildListMessage,
  alerts: buildAlertsMessage,
  accountUsersUsage: buildAccountUsersUsageMessage,
  proManagerUsers: buildProManagerUsersMessage,
};

const sendMessageToQueue = async (request, source) => {
  const message = buildMessageMethods[source](request);
  logger.info('message', message);
  try {
    const { data } = await axios.post(`${process.env.LD_MICROSERVICE_URL}/list/download`, message);
    return data;
  } catch (err) {
    const { data } = err.response;
    logger.error('err', JSON.stringify(data));
  }
};

export { sendMessageToQueue };
