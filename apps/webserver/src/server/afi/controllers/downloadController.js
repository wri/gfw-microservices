const { sendMessageToQueue } = require('../../downloader');

/**
 * @summary handles afi analysis endpoint
 * @param {Object} request Express Request
 * @param {Object} response Express Respond
 */

module.exports = async (request, response) => {
  const { listId } = request.query;

  if (!listId) {
    return request.status(400).send('Missing listId');
  }

  try {
    const msg = await sendMessageToQueue({ request }, 'afi');
    return response.status(200).send(msg);
  } catch (error) {
    console.error('AFI Deforestation KPIs download failed on server', error);
    response.status(500).send(error);
  }
};
