const axios = require('axios');
const Slack = require('@slack/bolt');

/**
 * @description - send notification to the slack log channel from the backend
 *
 * @param {string} text - Title of notification / error
 * @param {Object} data - Data to be logged
 * @param {string} userInfo - optional user info to be logged
 */

const sendNotification = async (text, data, userInfo) => {
  const slackApp = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
  });

  // only first 1000 characters of the data string to comply with slack limits
  const truncatedDataString = JSON.stringify(data, null, '\t').slice(0, 1000);

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:warning: *${text}*`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `NODE_ENV: *${process.env.NODE_ENV}*`,
      },
    },
  ];

  if (userInfo) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `user info: \`\`\` ${userInfo} \`\`\``,
      },
    });
  }

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `data: \`\`\` ${truncatedDataString} \`\`\``,
    },
  });

  await slackApp.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_LOG_CHANNEL,
    text,
    blocks: blocks,
  });
};

module.exports = {
  sendNotification,
};
