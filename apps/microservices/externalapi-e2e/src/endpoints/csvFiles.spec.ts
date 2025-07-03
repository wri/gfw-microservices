import postRedirectHeaders from './postRedirectHeaders';
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;
const list = process.env.TEST_LIST;
describe('API Endpoints', () => {
  it(
    'should create a geojson file for download',
    async () => {
      try {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${list}/analysis/DefReport/generate`,
          {
            userEmail: email,
            outputType: 'verifiableCredential',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_TOKEN,
            },
          }
        );

        expect(res.status).toBe(201);
        expect(res.data).toBe('');
      } catch (error) {
        console.error('endpoints error', error.stack || error, error.response.data);
        throw error;
      }
    },
    30 * 1000
  );
  it(
    'should validate CSV zip file has expected files',
    async () => {
      try {
        const { apiResponse, zipFileNames } = await pollApiUntilComplete(
          `${BASE_URL}/api/v1/list/${list}/analysis/DefReport/status`,
          {
            method: 'GET',
            headers: {
              'x-api-key': API_TOKEN,
            },
          },
          2000, // Poll every 2 seconds
          60000 // Timeout after 60 seconds
        );
        expect(apiResponse.status).toBe(200);
        expect(apiResponse.data.status).toBe('Completed');
        expect(apiResponse.data).toBeTruthy();
        expect(apiResponse.data).toHaveProperty('listId');
        expect(typeof apiResponse.data.listId).toBe('string');
        expect(apiResponse.data.listId).toBe(list);
        expect(typeof apiResponse.data.status).toBe('string');

        const expectedFileNames = [
          '_forest_change_diagnostic_list_summary.csv',
          '_forest_change_diagnostic_location_summary.csv',
          '_sensitive_areas_loss_forests.csv',
          '_sensitive_areas_loss_of_forests_aggregate.csv',
          '_sensitive_areas_percentage_historic_area_lost.csv',
          '_sensitive_areas_percentage_historic_area_lost_aggregate.csv',
          '_south_america_loss_of_forests.csv',
          '_south_america_overlap.csv',
          '_south_america_overlap_aggregate.csv',
          '_argentina_overlap.csv',
          '_argentina_overlap_aggregate.csv',
          '_argentina_loss_of_forests.csv',
          '_argentina_loss_of_forests_aggregate.csv',
          '_colombia_overlap.csv',
          '_colombia_overlap_aggregate.csv',
          '_colombia_loss_of_forests.csv',
          '_colombia_loss_of_forests_aggregate.csv',
          '_south_east_asia_tcl.csv',
          '_south_east_asia_tcl_aggregate.csv',
          '_south_east_asia_overlap.csv',
          '_south_east_asia_overlap_aggregate.csv',
        ];
        expect(zipFileNames).toEqual(expect.arrayContaining(expectedFileNames));
        expect(zipFileNames.length).toBe(expectedFileNames.length);

        console.log('API completed with result:', apiResponse);
        console.log('Files in zip:', zipFileNames);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    },
    90 * 1000
  );
});

interface ApiResponse {
  status: 'Pending' | 'Completed' | 'Failed';
  resultUrl?: string;
  data?: any;
}

interface PollResult {
  apiResponse: ApiResponse;
  zipFileNames: string[];
}

async function pollApiUntilComplete(
  url: string,
  options = {},
  pollIntervalMs = 1000,
  timeoutMs = 30000
): Promise<PollResult> {
  const startTime = Date.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Check for timeout
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Polling timeout: API did not complete within the specified time');
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status === 'Completed') {
        if (!result.resultUrl) {
          throw new Error('No resultUrl provided in completed API response');
        }

        // Download and unzip the file
        const zipResponse = await fetch(result.resultUrl);
        if (!zipResponse.ok) {
          throw new Error(`Failed to download zip file: ${zipResponse.status}`);
        }

        const zipBlob = await zipResponse.blob();
        const zip = await JSZip.loadAsync(zipBlob);

        // Extract file names from zip
        const zipFileNames = Object.keys(zip.files).filter((fileName) => !zip.files[fileName].dir);

        return {
          apiResponse: result,
          zipFileNames,
        };
      } else if (result.status === 'Failed') {
        throw new Error('API request failed');
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      throw new Error(`Polling error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
