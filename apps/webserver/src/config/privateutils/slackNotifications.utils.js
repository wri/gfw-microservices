const axios = require('axios');
const Slack = require('@slack/bolt');

/**
 * @description - send notification to the slack log channel from the backend
 *
 * @param {string} text - Title of notification / error
 * @param {Object} data - Data to be logged
 * @param {Object} userInfo - optional user info to be logged
 * @return {null}
 */

const sendNotification = async (text, data, userInfo) => {

  const slackApp = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
  });

  await slackApp.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_LOG_CHANNEL,
    text,
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:warning: *${text}*`
        }
      },
      ...(userInfo ? [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `user info: \`\`\` ${userInfo} \`\`\``
        }
      }]: []),
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `data: \`\`\` ${data} \`\`\``
        }
      }
    ]
  });
};

module.exports = {
  sendNotification
};
