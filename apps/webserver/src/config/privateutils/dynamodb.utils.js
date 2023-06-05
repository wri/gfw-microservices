/** ******************************************************************
*   @name: dynamodb.utils.js
*   @description : A utility file to allow calling the dynamoDB AWS API.
                   This is used to create a temporary table in dynamoDB.
                   This was done due to locks happening in SQL due to
                   the high volume of data being written to it.                
*   @function {createNewDynamoDBTable}
*
********************************************************************/

const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
  sslEnabled: true,
});

// Important variables for dynamoDB
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

/**
 * @function  getDynamoDBTableStatus
 * @summary   Checks if the table has been successfully created in DynamoDB
 * @param {String} TableName    The DynamoDB table name
 * @param {Integer} max_retries Recursive counter
 */
const getDynamoDBTableStatus = (TableName, max_retries) => {
  return new Promise((resolve, reject) => {
    dynamodb.describeTable({ TableName }, (err, data) => {
      if (err) {
        reject(err);
        console.log(err, err.stack);
      } else {
        if (data.Table.TableStatus === 'CREATING' && max_retries <= 15) {
          setTimeout(() => {
            resolve(getDynamoDBTableStatus(TableName, max_retries + 1));
          }, 5000);
        } else {
          resolve();
        }
      }
    });
  });
};

/**
 * Creates a DynamoDB table to store analysis results. Gets deleted when done processing.
 * @param {Object} req
 * @param {String} listName
 */
const createNewDynamoDBTable = (req, listName) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: listName,
      AttributeDefinitions: [
        {
          AttributeName: 'location_id',
          AttributeType: 'N',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'location_id',
          KeyType: 'HASH',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      StreamSpecification: {
        StreamEnabled: false,
      },
    };

    // Call DynamoDB to create the table
    dynamodb.createTable(params, (err) => {
      if (err) {
        console.log('Error trying to create the DynamoDB table: ', err);
        reject(err);
      }
      resolve();
    });
  });
};

/**
 * Deletes a DynamoDB table.
 * @param {Object} req
 * @param {String} listName
 */
const deleteDynamoDBTable = (req, listName) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: listName,
    };

    // Call DynamoDB to create the table
    dynamodb.deleteTable(params, (err) => {
      if (err) {
        console.log('Error trying to delete the DynamoDB table: ', err);
        reject(err);
      }
      resolve();
    });
  });
};

module.exports = {
  createNewDynamoDBTable,
  getDynamoDBTableStatus,
  deleteDynamoDBTable,
};
