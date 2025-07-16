import postRedirectHeaders from './postRedirectHeaders';
import AdmZip from 'adm-zip';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;
const list = process.env.TEST_LIST;
describe('Validate CSV Files for FCD', () => {
  it(
    'should generate FCD analysis file',
    async () => {
      try {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${list}/analysis/FCD/generate`,
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
    'should validate CSV zip bundle has expected files',
    async () => {
      try {
        const { apiResponse, zipFileNames } = await pollApiUntilComplete(
          `${BASE_URL}/api/v1/list/${list}/analysis/FCD/status`,
          {
            method: 'GET',
            headers: {
              'x-api-key': API_TOKEN,
            },
          },
          2000, // Poll every 2 seconds
          60000 // Timeout after 60 seconds
        );
        expect(apiResponse.status).toBe('Completed');
        expect(apiResponse).toHaveProperty('listId');
        expect(typeof apiResponse.listId).toBe('string');
        expect(apiResponse.listId).toBe(list);

        const expectedFileNames = [
          'AAT Argentina Polygons Generic_argentina_loss_of_forests.csv',
          'AAT Argentina Polygons Generic_argentina_loss_of_forests_aggregate.csv',
          'AAT Argentina Polygons Generic_argentina_overlap.csv',
          'AAT Argentina Polygons Generic_argentina_overlap_aggregate.csv',
          'AAT Argentina Polygons Generic_forest_change_diagnostic_list_summary.csv',
          'AAT Argentina Polygons Generic_forest_change_diagnostic_location_summary.csv',
          'AAT Argentina Polygons Generic_sensitive_areas_loss_forests.csv',
          'AAT Argentina Polygons Generic_sensitive_areas_loss_of_forests_aggregate.csv',
          'AAT Argentina Polygons Generic_sensitive_areas_percentage_historic_area_lost_aggregate.csv',
          'AAT Argentina Polygons Generic_sensitive_areas_percentage_historic_area_lost.csv',
          'AAT Argentina Polygons Generic_south_america_loss_of_forests.csv',
          'AAT Argentina Polygons Generic_south_america_loss_of_forests_aggregate.csv',
          'AAT Argentina Polygons Generic_south_america_overlap.csv',
          'AAT Argentina Polygons Generic_south_america_overlap_aggregate.csv',
          'README.csv',
        ];
        expect(zipFileNames.sort()).toEqual(expectedFileNames.sort());

        console.log('API completed with result:', apiResponse);
        console.log('Files in zip:', zipFileNames);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    },
    60 * 1000
  );
});

describe('Validate CSV Files for DefReport', () => {
  it(
    'should generate DefReport analysis file',
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
    'should validate CSV zip bundle has expected files',
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
        expect(apiResponse.status).toBe('Completed');
        expect(apiResponse).toHaveProperty('listId');
        expect(typeof apiResponse.listId).toBe('string');
        expect(apiResponse.listId).toBe(list);

        const expectedFileNames = ['AAT Argentina Polygons Generic.json'];
        expect(zipFileNames.sort()).toEqual(expectedFileNames.sort());

        console.log('API completed with result:', apiResponse);
        console.log('Files in zip:', zipFileNames);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    },
    60 * 1000
  );
});

describe('Validate CSV Files for Alerts', () => {
  it(
    'should generate Alerts analysis file',
    async () => {
      try {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${list}/analysis/Alerts/generate`,
          {
            userEmail: email,
            outputType: 'verifiableCredential',
            startDate: '01-01-2024',
            endDate: '07-05-2025',
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
    'should validate CSV zip bundle has expected files',
    async () => {
      try {
        const { apiResponse, zipFileNames } = await pollApiUntilComplete(
          `${BASE_URL}/api/v1/list/${list}/analysis/Alerts/status`,
          {
            method: 'GET',
            headers: {
              'x-api-key': API_TOKEN,
            },
          },
          2000, // Poll every 2 seconds
          60000 // Timeout after 60 seconds
        );
        expect(apiResponse.status).toBe('Completed');
        expect(apiResponse).toHaveProperty('listId');
        expect(typeof apiResponse.listId).toBe('string');
        expect(apiResponse.listId).toBe(list);

        const expectedFileNames = [
          'AAT Argentina Polygons Generic_IntegratedAlerts_NaturalForest_Daily.csv',
          'README.csv',
        ];
        expect(zipFileNames.sort()).toEqual(expectedFileNames.sort());

        console.log('API completed with result:', apiResponse);
        console.log('Files in zip:', zipFileNames);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    },
    60 * 1000
  );
});

describe('Validate CSV Files for GHG', () => {
   it(
      'should generate GHG download',
      async () => {
         const listId = '8695';
        try {
          const res = await postRedirectHeaders(
            `${BASE_URL}/api/v1/list/${listId}/analysis/GHG/generate`,
            {
              userEmail: email,
              startDate: '01-01-2024',
              endDate: '07-01-2024',
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
          console.error('GHG/generate error', error.stack || error, error.response.data);
          throw error;
        }
      },
      30 * 1000
    );
  it(
    'should validate CSV bundle file has expected files',
    async () => {
      const listId = '8695';
      const listName = 'GHG Analysis List';
      try {
        const { apiResponse, zipFileNames } = await pollApiUntilComplete(
          `${BASE_URL}/api/v1/list/${listId}/analysis/GHG/status`,
          {
            method: 'GET',
            headers: {
              'x-api-key': API_TOKEN,
            },
          },
          2000, // Poll every 2 seconds
          60000 // Timeout after 60 seconds
        );
        expect(apiResponse.status).toBe('Completed');
        expect(apiResponse).toHaveProperty('listId');
        expect(typeof apiResponse.listId).toBe('string');
        expect(apiResponse.listId).toBe(listId);

        const expectedFileNames = [`${listName}_green_house_gas_emissions.csv`, 'README.csv'];
        expect(zipFileNames.sort()).toEqual(expectedFileNames.sort());

        console.log('API completed with result:', apiResponse);
        console.log('Files in zip:', zipFileNames);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    },
    60 * 1000
  );
});

interface ApiResponse {
  status: 'Pending' | 'Completed' | 'Failed';
  resultUrl?: string;
  listId: string;
  [key: string]: unknown;
}

interface PollResult {
  apiResponse: ApiResponse;
  zipFileNames: string[];
}

async function pollApiUntilComplete(
  url: string,
  options = {},
  pollIntervalMs = 1000,
  timeoutMs = 10000
): Promise<PollResult> {
  const startTime = Date.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Polling timeout: API did not complete within the specified time');
    }

    try {
      const response = await fetch(url, { ...options, redirect: 'follow' });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status === 'Completed') {
        if (!result.resultUrl || !/^https?:\/\//.test(result.resultUrl)) {
          console.error('Invalid resultUrl:', result.resultUrl);
          throw new Error(`Invalid or missing resultUrl: ${result.resultUrl}`);
        }

        const zipResponse = await fetch(result.resultUrl, {
          headers: {
            'x-api-key': process.env.API_TOKEN,
          },
        });

        if (!zipResponse.ok) {
          const errorText = await zipResponse.text();
          console.error('Zip download failed:', {
            status: zipResponse.status,
            contentType: zipResponse.headers.get('Content-Type'),
            body: errorText,
          });
          throw new Error(`Failed to download zip file: ${zipResponse.status} ${errorText}`);
        }

        const contentType = zipResponse.headers.get('Content-Type') || 'unknown';
        if (
          !contentType.includes('application/zip') &&
          !contentType.includes('application/octet-stream')
        ) {
          const errorText = await zipResponse.text();
          console.error('Invalid zip content type:', { contentType, body: errorText });
          throw new Error(
            `Invalid content type: ${contentType}. Expected application/zip or application/octet-stream`
          );
        }

        const arrayBuffer = await zipResponse.arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
          throw new Error('Downloaded zip file is empty');
        }

        try {
          const zip = new AdmZip(Buffer.from(arrayBuffer));
          const zipEntries = zip.getEntries();
          const zipFileNames = zipEntries
            .map((entry) => entry.entryName)
            .filter((name) => !name.endsWith('/')); // Exclude directories

          if (zipFileNames.length === 0) {
            throw new Error('Zip file contains no files');
          }

          return {
            apiResponse: result,
            zipFileNames,
          };
        } catch (zipError) {
          console.error('Admin System: Zip error:', {
            url: result.resultUrl,
            message: zipError instanceof Error ? zipError.message : zipError,
            stack: zipError instanceof Error ? zipError.stack : undefined,
          });
          throw new Error(
            `Failed to process zip file: ${
              zipError instanceof Error ? zipError.message : 'Unknown error'
            }`
          );
        }
      } else if (result.status === 'Failed') {
        console.error('API status failed:', result);
        throw new Error('API request failed');
      }

      console.log('Polling again in', pollIntervalMs, 'ms...');
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      console.error('Fetch error in pollApiUntilComplete:', {
        url,
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
