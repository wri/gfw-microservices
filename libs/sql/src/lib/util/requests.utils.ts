import fetch, { Response } from 'node-fetch';

export const requestAnalysisProcess = (url, requestBody): Promise<Response> => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  };

  return fetch(url, options);
};
