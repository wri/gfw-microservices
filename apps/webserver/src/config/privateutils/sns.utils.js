/** ******************************************************************
 *   @name: sns.utils.js
 *   @description : A utility file to allow calling various
 * functionality from AWS SDK to create and publish SNS
 *
 *   @function {publish}
 * Code example to publish a message to SNS topic from "Developer Guide for SDK Version 3"
 * - https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_sns_code_examples.html - Publish a Message to an Amazon SNS Topic
 ********************************************************************/
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const config = require('../config');

const snsClient = new SNSClient();

const factory = (factoryKey, content) => {
  let subject, message;
  switch (factoryKey) {
    // When new organization has been requested for approval
    case config.platformVars.snsType.NEW_ORGANIZATION:
      subject = 'GFW Pro Account Application Notification';
      message = Object.values(content).join(', ');
      break;
    // When a GFW List is selected to be updated
    case config.platformVars.snsType.UPDATE_GFWLIST:
      subject = `Updating Global Forest Watch ${content} List`;
      message = `Global Forest Watch List is being updated ${content}.`;
      break;
  }
  return { subject, message };
};

const publish = (factoryKey, content) => {
  // Generate the appropriate subject and message for SNS
  const { subject, message } = factory(factoryKey, content);

  // Parameters for SNS publish API
  const params = {
    Message: message,
    Subject: subject,
    TopicArn: config.AWSVars.sns.topicARN,
  };

  // API call
  snsClient
    .send(new PublishCommand(params))
    .then((response) => {
      console.log('SNS Message published', response);
    })
    .catch((err) => {
      console.log('Error: could not publish', err);
    });
};

module.exports = {
  publish,
};
