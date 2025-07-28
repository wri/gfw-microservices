import axios from 'axios';

// Axios does not send headers when following 302 redirects for POST requests
// This function is used to forward headers to redirected endpoints.
export async function postRedirectHeaders(url, body, headers) {
  try {
    return await axios.post(url, body, {
      ...headers,
      maxRedirects: 0,
    });
  } catch (error) {
    if (error.response.status === 302) {
      return postRedirectHeaders(error.response.headers.location, body, headers);
    } else {
      throw error;
    }
  }
}

export async function deleteListByName(keywords) {
  const BASE_URL = process.env.HOST;
  const API_TOKEN = process.env.API_TOKEN;
  const email = process.env.USER_EMAIL;

  interface ListApiResponse {
    listId: number;
    listName: string;
    locationCount: number;
    error: string;
  }

  for (let listId = 9680; listId <= 10000; listId++) {
    try {
      // GET request to check if list exists
      const listInfo = await fetch(`${BASE_URL}/api/v1/list/${listId}`, {
        method: 'GET',
        headers: {
          'x-api-key': API_TOKEN,
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
      });

      const listData: ListApiResponse = await listInfo.json();
      console.log(`List ${listId} response:`, listData);

      if (listData.error === 'Not Found') {
        continue;
      }

      // Deleting list if it matches any of the keywords
      if (keywords.some((keyword) => listData.listName.includes(keyword))) {
        await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${listId}/delete`,
          {
            userEmail: email,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );
      }
    } catch (error) {
      console.error(`Error processing list ${listId}:`, {
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Error processing list ${listId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
