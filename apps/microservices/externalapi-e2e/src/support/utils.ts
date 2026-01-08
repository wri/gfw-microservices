import axios from 'axios';

// Axios does not send headers when following 302 redirects for POST requests
// This function is used to forward headers to redirected endpoints.
export async function postRedirectHeaders(url, body, headers) {
  try {
    const response = await axios.post(url, body, {
      ...headers,
      maxRedirects: 0,
      validateStatus: (status) => status < 400 || status === 302,
    });

    // Handle 302 redirect in success path
    if (response.status === 302) {
      const location = response.headers.location;
      return postRedirectHeaders(location, body, headers);
    }

    // Return only the necessary parts to avoid circular JSON serialization
    // Convert headers to plain object to avoid circular references
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: { ...response.headers },
    };
  } catch (error) {
    // Clean up circular references in the error before re-throwing
    if (error.response) {
      const cleanError: any = new Error(error.message);
      cleanError.name = error.name;
      cleanError.stack = error.stack;
      cleanError.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: { ...error.response.headers },
        data: error.response.data,
      };
      throw cleanError;
    }
    throw error;
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
