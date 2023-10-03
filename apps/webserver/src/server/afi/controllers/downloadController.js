const AWS = require('aws-sdk');

const { sendMessageToQueue } = require('../utils/afi.utils');
const { rest } = require('lodash');
/**
 * @summary handles afi analysis endpoint
 * @param {Object} req Express Request
 * @param {Object} res Express Respond
 */

module.exports = async (req, res) => {
  const { listID } = req.query;

  if (!listID) {
    return res.status(400).send('Missing listId');
  }

  const msg = await sendMessageToQueue(req);

  return res.status(200).send(msg);
};
