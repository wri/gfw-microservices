/** ******************************************************************
*   @name: sns.utils.js
*   @description : A utility file to allow calling various
* functionality from AWS SDK to create and publish SNS
*
*   @function {publish}

********************************************************************/
const AWS = require('aws-sdk');
const config = require('../config');

const SNS = new AWS.SNS({ apiVersion: '2010-03-31 ' });

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
  SNS.publish(params, (err, data) => {
    if (err) {
      console.log('Error: could not publish', err);
    } else {
      console.log('Message published');
    }
  });
};

module.exports = {
  publish,
};
