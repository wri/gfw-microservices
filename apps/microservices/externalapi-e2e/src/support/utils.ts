import axios from 'axios';

const MAX_REDIRECTS = 10; // Maximum number of redirects to follow

/**
 * Sanitizes an error object to remove circular references (e.g., from axios)
 * This prevents "Converting circular structure to JSON" errors in Jest workers
 */
export function sanitizeError(error: any): Error {
  if (axios.isAxiosError(error)) {
    const cleanError: any = new Error(error.message);
    cleanError.name = error.name;
    cleanError.stack = error.stack;

    if (error.response) {
      cleanError.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: { ...error.response.headers },
        data: error.response.data,
      };
    }

    if (error.config) {
      cleanError.config = {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers ? { ...error.config.headers } : undefined,
      };
    }

    return cleanError;
  }

  // For non-axios errors, return as-is
  return error;
}

// Axios does not send headers when following 302 redirects for POST requests
// This function is used to forward headers to redirected endpoints.
export async function postRedirectHeaders(url, body, headers, redirectCount = 0) {
  // Prevent infinite redirect loops
  if (redirectCount >= MAX_REDIRECTS) {
    throw new Error(`Maximum redirect limit (${MAX_REDIRECTS}) exceeded`);
  }

  try {
    const response = await axios.post(url, body, {
      ...headers,
      maxRedirects: 0,
      validateStatus: (status) => status < 400 || status === 302,
    });

    // Handle 302 redirect in success path
    if (response.status === 302) {
      const location = response.headers.location;
      return postRedirectHeaders(location, body, headers, redirectCount + 1);
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

/**
 * Ensures that required analyses for a list are not expired.
 * Throws a descriptive error with instructions if any analyses are expired.
 *
 * @param listId - The list ID to check
 * @param requiredAnalyses - Array of analysis types to check (e.g., ['DefReport', 'FCD', 'Alerts'])
 * @throws Error with regeneration instructions if any analyses are expired or missing
 */
export async function ensureAnalysesNotExpired(
  listId: number,
  requiredAnalyses: string[]
): Promise<void> {
  const BASE_URL = process.env.HOST;
  const API_TOKEN = process.env.API_TOKEN;
  const USER_EMAIL = process.env.USER_EMAIL;

  interface AnalysisStatusResponse {
    status: string;
    listId?: string;
    resultUrl?: string;
    creationDate?: string;
    expirationDate?: string;
  }

  const expiredAnalyses: string[] = [];
  const missingAnalyses: string[] = [];

  for (const analysisType of requiredAnalyses) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/list/${listId}/analysis/${analysisType}/status`,
        {
          method: 'GET',
          headers: {
            'x-api-key': API_TOKEN,
          },
        }
      );

      if (!response.ok) {
        missingAnalyses.push(analysisType);
        continue;
      }

      const result: AnalysisStatusResponse = await response.json();

      // Check if analysis is completed
      if (result.status !== 'Completed') {
        missingAnalyses.push(analysisType);
        continue;
      }

      // Check if analysis has expired
      if (result.expirationDate) {
        const expirationTime = new Date(result.expirationDate);
        const now = new Date();
        if (now > expirationTime) {
          expiredAnalyses.push(analysisType);
        }
      }
    } catch (error) {
      missingAnalyses.push(analysisType);
    }
  }

  // If any analyses are expired or missing, throw error with instructions
  if (expiredAnalyses.length > 0 || missingAnalyses.length > 0) {
    const errorMessages: string[] = ['\n ⚠️ TEST DATA EXPIRED OR MISSING \n'];

    if (expiredAnalyses.length > 0) {
      errorMessages.push(`Expired analyses for list ${listId}: ${expiredAnalyses.join(', ')}`);
    }

    if (missingAnalyses.length > 0) {
      errorMessages.push(`Missing analyses for list ${listId}: ${missingAnalyses.join(', ')}`);
    }

    errorMessages.push('\n TO FIX: Regenerate the analyses using one of these methods:\n');
    errorMessages.push('Method 1 - Regenerate specific analyses:');

    const allAnalysesToRegenerate = [...new Set([...expiredAnalyses, ...missingAnalyses])];
    allAnalysesToRegenerate.forEach((analysisType) => {
      errorMessages.push(
        `  curl -L --post302 -H "x-api-key: YOUR_API_TOKEN" -H "Content-Type: application/json" \\`,
        `    -X POST -d '{"userEmail": "YOUR_EMAIL"}' \\`,
        `    "${BASE_URL}/api/v1/list/${listId}/analysis/${analysisType}/analyze"\n`
      );
    });

    errorMessages.push(
      `Estimated time: ~${
        allAnalysesToRegenerate.length * 5
      } minutes (all analyses run in parallel)\n`
    );

    errorMessages.push('Method 2 - Find a different test list:');
    errorMessages.push(
      `HOST=${BASE_URL} API_TOKEN=YOUR_API_TOKEN npx ts-node -P apps/microservices/externalapi-e2e/tsconfig.json \\`,
      `    apps/microservices/externalapi-e2e/src/support/find-valid-test-list.ts\n`
    );

    errorMessages.push(
      'TIP: Analysis results expire after ~5 days. Consider updating the TEST_LIST',
      '   environment variable or EAPI_E2E_SETTINGS secret with a list that has fresh data.\n'
    );

    throw new Error(errorMessages.join('\n'));
  }
}
