import axios from 'axios';

// Axios does not send headers when following 302 redirects for POST requests
// This function is used to forward headers to redirected endpoints.
export async function postRedirectHeaders(url, body, headers) {
  try {
    return await axios.post(url, body, {
      ...headers,
      maxRedirects: 0,
      validateStatus: (status) => status < 400 || status === 302,
    });
  } catch (error) {
    if (error.response?.status === 302) {
      return postRedirectHeaders(error.response.headers.location, body, headers);
    } else {
      throw error;
    }
  }
}

export async function deleteListByName(keywords: string[]): Promise<void> {
  const BASE_URL = process.env.HOST;
  const API_TOKEN = process.env.API_TOKEN;
  const email = process.env.USER_EMAIL;

  interface ListApiResponse {
    listId: number;
    listName: string;
    locationCount: number;
    error?: string;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/list?pageSize=100&pageNum=0`, {
      method: 'GET',
      headers: {
        'x-api-key': API_TOKEN,
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const recentLists: ListApiResponse[] = await response.json();

    if (!Array.isArray(recentLists)) {
      throw new Error('API response is not a valid array');
    }

    for (const list of recentLists) {
      try {
        if (keywords.some((keyword) => list.listName.includes(keyword))) {
          await postRedirectHeaders(
            `${BASE_URL}/api/v1/list/${list.listId}/delete`,
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
          console.log(`Deleted list ${list.listId}`);
        }
      } catch (error) {
        console.error(`Error processing list ${list.listId}:`, {
          message: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        continue;
      }
    }
  } catch (error) {
    console.error('Error fetching recent lists:', {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(
      `Failed to fetch or process lists: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
