/** ******************************************************************
*   @name: lambda.utils.js
*   @description : A utility file to allow calling various
*                 functionality from AWS Lambda
*
*   @function {invoke}
********************************************************************/
// Imports for this module
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: 'us-east-1',
  httpOptions: {
    timeout: 300000
  }
});

const invoke = (FunctionName, payload = '') => {
  const parameters = {
    FunctionName: `${FunctionName}-${process.env.NODE_ENV}`,
    Payload: JSON.stringify(payload),
    InvocationType: 'RequestResponse',
  };
  console.log('FunctionName', parameters.FunctionName);
  
  return lambda.invoke(parameters).promise();
};

module.exports = {
  invoke
};

