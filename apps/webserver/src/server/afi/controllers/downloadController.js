const { sendMessageToQueue } = require('../utils/afi.utils');
const { rest } = require('lodash');
/**
 * @summary handles afi analysis endpoint
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */

module.exports = async (req, res) => {
  const { listId } = req.query;

  if (!listId) {
    return res.status(400).send('Missing listId');
  }

  try {
    const msg = await sendMessageToQueue(req);
    return res.status(200).send(msg);
  } catch (error) {
    console.error('AFI Deforestation KPIs download failed on server', error);
    res.status(500).send(error);
  }
};
