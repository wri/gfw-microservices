import fetch from 'node-fetch';
const AWS_ANALYSIS_LAMBDA_URL = process.env.AWS_ANALYSIS_LAMBDA_URL;

export const requestAnalysisProcess = (requestBody) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  };

  return fetch(AWS_ANALYSIS_LAMBDA_URL, options);
};
