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
    // err.response is undefined for connection errors (service down, DNS, timeout),
    // so guard before destructuring to avoid masking the real cause.
    if (err.response) {
      logger.error('err', JSON.stringify(err.response.data));
    } else {
      logger.error(
        `Failed to reach list-downloader microservice at ${process.env.LD_MICROSERVICE_URL}: ${err.message}`
      );
    }
    // Re-throw so callers (e.g. startTaskToCreateFile) return a 500 instead of
    // a 200 with an undefined filter, which makes the download appear accepted
    // when it never reached the microservice.
    throw err;
  }
};

export { sendMessageToQueue };
