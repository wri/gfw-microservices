import fetch, { Response } from 'node-fetch';

export const requestAnalysisProcess = (requestBody): Promise<Response> => {
  const AWS_ANALYSIS_LAMBDA_URL = process.env.AWS_ANALYSIS_LAMBDA_URL;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  };

  return fetch(AWS_ANALYSIS_LAMBDA_URL, options);
};
