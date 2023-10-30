/** ******************************************************************
 *   @name: lambda.utils.js
 *   @description : A utility file to allow calling various
 *                 functionality from AWS Lambda
 *
 *   @function {invoke}
 ********************************************************************/
// Imports for this module
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const client = new LambdaClient({
  apiVersion: '2015-03-31',
  region: 'us-east-1',
  httpOptions: {
    timeout: 300000,
  },
});

const invoke = async (FunctionName, payload = '') => {
  const functionName = `${FunctionName}-${process.env.NODE_ENV}`;
  const payloadString = JSON.stringify(payload);
  const parameters = {
    FunctionName: functionName,
    Payload: payloadString,
    InvocationType: 'RequestResponse',
  };
  console.log('FunctionName', functionName);

  const command = new InvokeCommand(parameters);
  const { Payload: LambdaPayload } = await client.send(command);
  const result = Buffer.from(LambdaPayload).toString();
  return { Payload: result };
};

module.exports = {
  invoke,
};
