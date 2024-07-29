/** ******************************************************************
 *   @name: lambda.utils.ts
 *   @description : A utility file to allow calling various
 *                 functionality from AWS Lambda
 *
 *   @function {invoke}
 ********************************************************************/
// Imports for this module
import { LambdaClient, InvokeCommand, InvocationType } from '@aws-sdk/client-lambda';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const LAMBDA_HTTP_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const client = new LambdaClient({
  apiVersion: '2015-03-31',
  region: 'us-east-1',
  requestHandler: new NodeHttpHandler({
    requestTimeout: LAMBDA_HTTP_TIMEOUT_MS,
  }),
});

const invoke = async (FunctionName: string, payload: object = {}) => {
  const functionName = `${FunctionName}-${process.env.NODE_ENV}`;
  const payloadString = JSON.stringify(payload);
  const parameters = {
    FunctionName: functionName,
    Payload: Buffer.from(payloadString), // Ensure payload is a Buffer
    InvocationType: InvocationType.RequestResponse, // Explicitly use the enum
  };
  console.log('FunctionName', functionName);

  const command = new InvokeCommand(parameters);
  const { Payload: LambdaPayload } = await client.send(command);
  const result = Buffer.from(LambdaPayload).toString();
  return { Payload: result };
};

export { invoke };
