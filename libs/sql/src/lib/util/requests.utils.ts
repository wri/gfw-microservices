import fetch, { Response } from 'node-fetch';

export const requestAnalysisProcess = (url, requestBody): Promise<Response> => {
  const AWS_ANALYSIS_LAMBDA_URL = process.env.AWS_ANALYSIS_LAMBDA_URL;
  // TODO: GPV-3409: these debug logs will be removed after issue is resolved
  console.log('DDDDebug requestAnalysisProcess urlparam', url);
  console.log('DDDDebug requestAnalysisProcess urlenv', AWS_ANALYSIS_LAMBDA_URL);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  };

  return fetch(url, options);
};
