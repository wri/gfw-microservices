import buildAfiMessage from './afi.message';
import buildListMessage from './list.message';
import buildAlertsMessage from './alerts.message';
import buildAccountUsersUsageMessage from './account.users.usage.message';
import axios from 'axios';

const buildMessageMethods = {
  afi: buildAfiMessage,
  list: buildListMessage,
  alerts: buildAlertsMessage,
  accountUsersUsage: buildAccountUsersUsageMessage,
};

const sendMessageToQueue = async (request, source) => {
  const message = buildMessageMethods[source](request);
  console.log('message', message);
  try {
    const { data } = await axios.post(`${process.env.LD_MICROSERVICE_URL}/list/download`, message);
    return data;
  } catch (err) {
    const { data } = err.response;
    console.log('err', JSON.stringify(data));
  }
};

export { sendMessageToQueue };
