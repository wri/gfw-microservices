/** ******************************************************************
*   @name: sqs.utils.js
*   @description : A utility file to allow calling various
* functionality from AWS SDK to create and
* send SQS messages
*
*   @function {sendMessage}

********************************************************************/
const AWS = require('aws-sdk');
const config = require('../config');

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  region: 'us-east-1',
});

function partition(array, groupSize) {
  const output = [];
  for (let i = 0; i < array.length; i += groupSize) {
    output[output.length] = array.slice(i, i + groupSize);
  }
  return output;
}

/**
 * @summary Generates a unique string
 */
const uniqueIdGenerator = () => {
  let uniqueId = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  //Step 1: Determine the current time in milliseconds (Epoch Time).
  const milliseconds = new Date().getTime();

  //Step 2: Get a random integer to add to file name to make sure it is unique.
  const randomSeed = Math.floor(Math.random() * 1000000);

  // Step 3: Generate some random characters
  for (let i = 0; i < 6; i++) {
    uniqueId += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return uniqueId + milliseconds + randomSeed;
};

/**
 * @summary Sends list level messages to the SQS queue
 * @param {String} organization_user_id The user id attached to that organization
 * @param {String} user_first_name  The user's first name
 * @param {String} user_last_name The user's last name
 * @param {String} user_email The user's email address
 * @param {String} organization_database The organization DB
 * @param {String} list_name The list name
 * @param {String} list_table The list table name to write to
 * @param {String} analysis_table The analysis table to write to
 * @param {String} organization_id The organization id
 * @param {boolean} isEdit A boolean to determine if we are editing the list
 * @param {number} location_id The location id, which is defaulted to 0 here as we are processing list level analyses
 * @param {String} queue_url The queue URL
 */
const sendMessage = (
  organization_user_id,
  user_first_name = '',
  user_last_name = '',
  user_email = '',
  organization_database = '',
  list_name = '',
  list_table = '',
  analysis_table = 'Analyses',
  organization_id = '',
  isEdit = false,
  appendLocations = false,
  location_id = 0, // No Location
  queue_url = config.AWSVars.sqs.list_queue_url
) => {
  const json = {
    AnalysisTable: analysis_table,
    Analyses: [],
    Database: organization_database,
    OrganizationId: organization_id,
    EditList: isEdit,
    Environment: process.env.NODE_ENV,
    ListName: list_name,
    ListTable: list_table,
    LocationId: location_id,
    Retries: 0,
    UserEmail: user_email,
    FirstName: user_first_name,
    LastName: user_last_name,
    UserId: organization_user_id,
    AppendLocations: appendLocations ? 1 : 0,
  };
  const parameters = {
    QueueUrl: queue_url,
    MessageBody: JSON.stringify(json),
    MessageGroupId: uniqueIdGenerator(),
    MessageAttributes: {},
  };
  return sqs.sendMessage(parameters).promise();
};

const sendMessageBatch = (entries, queue_url) => {
  // Partition array into groups of ten
  const groups = partition(entries, 10);
  return Promise.all(
    groups.map((group) => {
      const parameters = {
        Entries: group.map((entry) => {
          return {
            Id: `${Math.random().toString(36).substring(7)}`,
            MessageBody: JSON.stringify(entry),
            MessageAttributes: {},
            MessageGroupId: uniqueIdGenerator(),
          };
        }),
        QueueUrl: queue_url,
      };
      return sqs.sendMessageBatch(parameters).promise();
    })
  );
};

module.exports = {
  sendMessage,
  uniqueIdGenerator,
  sendMessageBatch,
};
