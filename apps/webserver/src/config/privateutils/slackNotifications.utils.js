const Slack = require('@slack/bolt');

/**
 * @description - sends notification to the slack log channel from the backend
 * @param messageBlocks
 */

const sendNotification = async (messageBlocks) => {
  try {
    const slackApp = new Slack.App({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      token: process.env.SLACK_BOT_TOKEN,
    });

    return await slackApp.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_LOG_CHANNEL,
      text: 'GFWProErrorBoundary',
      blocks: messageBlocks,
    });
  } catch (error) {
    console.error('sendNotification', error.stack || error);
    throw error;
  }
};

function buildSlackNotificationMessage(contxtInfo) {
  const SLACK_TEXT_LENGTH_LIMIT = 1010;
  const { url, stackTrace, browserInfo, userInfo } = contxtInfo;
  const errorBlock = stackTrace.slice(0, SLACK_TEXT_LENGTH_LIMIT + url.length);
  const userBlock = getMaybeUserBlock(userInfo);

  const blocks = [
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: ':warning: *GFWProErrorBoundary*',
        },
        {
          type: 'mrkdwn',
          text: `NODE_ENV: ${process.env.NODE_ENV}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `\`${url}\` \`\`\`${errorBlock}\`\`\``,
      },
    },
    { ...userBlock },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `\`\`\`${browserInfo}\`\`\``,
      },
    },
  ];

  return blocks;
}

function getMaybeUserBlock(userInfo) {
  if (userInfo) {
    return {
      type: 'rich_text',
      elements: [
        {
          type: 'rich_text_quote',
          elements: [
            {
              type: 'text',
              text: 'OrgID\t',
            },
            {
              type: 'text',
              text: `${userInfo.OrgID}`,
              style: {
                code: true,
              },
            },
            {
              type: 'text',
              text: '\nUser\t',
            },
            {
              type: 'text',
              text: userInfo.first_name,
              style: {
                code: true,
              },
            },
            {
              type: 'text',
              text: '\t ID  ',
            },
            {
              type: 'text',
              text: `${userInfo.id}`,
              style: {
                code: true,
              },
            },
            {
              type: 'text',
              text: '\nEmail\t',
            },
            {
              type: 'text',
              text: userInfo.email,
              style: {
                code: true,
              },
            },
          ],
        },
      ],
    };
  }

  return {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_quote',
        elements: [
          {
            type: 'text',
            text: 'Could not get userInfo',
          },
        ],
      },
    ],
  };
}

module.exports = {
  sendNotification,
  buildSlackNotificationMessage,
};
