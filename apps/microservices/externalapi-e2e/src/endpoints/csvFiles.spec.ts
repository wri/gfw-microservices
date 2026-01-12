import { postRedirectHeaders } from '../support/utils';
import AdmZip from 'adm-zip';
import Papa from 'papaparse';
import axios from 'axios';

const BASE_URL = process.env.HOST;
const API_TOKEN = process.env.API_TOKEN;
const email = process.env.USER_EMAIL;
const list = process.env.TEST_LIST;
const ghgList = process.env.TEST_GHG_LIST;

interface FileExpectation {
  columns?: string[];
  isReadme?: boolean;
}

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
        console.error('endpoints error', error.stack || error, error?.response?.data);
        throw error;
      }
    },
    30 * 1000
  );

  it(
    'should validate CSV zip bundle has expected files and columns',
    async () => {
      const expectedFiles: Record<string, FileExpectation> = {
        'AAT Argentina Polygons Generic_argentina_overlap.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Data Layer',
            'Sub-Layer',
            'Overlap with Sub-layer (Ha)',
            'Overlap with Sub-Layer (%)',
          ],
        },
        'AAT Argentina Polygons Generic_argentina_loss_of_forests_aggregate.csv': {
          columns: [
            'List Name',
            'Data Layer Name',
            'Sub-Layer',
            'Forest Loss (ha)',
            'Year',
            'Loss (all years) (ha)',
            '% of Forest Loss',
          ],
        },
        'AAT Argentina Polygons Generic_forest_change_diagnostic_location_summary.csv': {
          columns: [
            'List Name',
            'Location Name',
            'State(s)',
            'Country (Countries)',
            'Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS)',
            'Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Primary Forest (%) (HISTORIC SITE CHARACTERISTICS)',
            'Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Protected Area (%) (HISTORIC SITE CHARACTERISTICS)',
            'Protected Area (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Peat (%) (HISTORIC SITE CHARACTERISTICS)',
            'Peat (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS)',
            'Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Volume',
            'Company ID',
            'Refinery Name',
            'Supplier Name',
            'Second Refinery Name',
            'Second Supplier Name',
            'Total Hectares',
          ],
        },
        'AAT Argentina Polygons Generic_forest_change_diagnostic_list_summary.csv': {
          columns: [
            'List Name',
            'Country (Countries)',
            'Tree Cover Extent (%) (HISTORIC SITE CHARACTERISTICS)',
            'Tree Cover Extent (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Primary Forest (%) (HISTORIC SITE CHARACTERISTICS)',
            'Primary Forest (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Protected Area (%) (HISTORIC SITE CHARACTERISTICS)',
            'Protected Area (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Peat (%) (HISTORIC SITE CHARACTERISTICS)',
            'Peat (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Intact Forest Landscape (%) (HISTORIC SITE CHARACTERISTICS)',
            'Intact Forest Landscape (ha) (HISTORIC SITE CHARACTERISTICS)',
            'Total Hectares',
          ],
        },
        'AAT Argentina Polygons Generic_argentina_loss_of_forests.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Data Layer Name',
            'Sub-Layer',
            'Forest Loss (ha)',
            'Year',
            'Loss (all years) (ha)',
            '% of Forest Loss',
          ],
        },
        'AAT Argentina Polygons Generic_sensitive_areas_percentage_historic_area_lost_aggregate.csv':
          {
            columns: [
              'List Name',
              'Data Layer Name',
              '% of Historic Area Lost',
              'Loss (all years) (ha)',
              'Tree Cover Extent (2000) (ha)',
            ],
          },
        'AAT Argentina Polygons Generic_south_america_loss_of_forests_aggregate.csv': {
          columns: ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
        },
        'AAT Argentina Polygons Generic_south_america_overlap.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Data Layer',
            'Sub-Layer',
            'Overlap with Sub-Layer (%)',
          ],
        },
        'AAT Argentina Polygons Generic_south_america_overlap_aggregate.csv': {
          columns: ['List Name', 'Data Layer', 'Sub-Layer', 'Overlap with Sub-Layer (%)'],
        },
        'AAT Argentina Polygons Generic_sensitive_areas_percentage_historic_area_lost.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Data Layer Name',
            '% of Historic Area Lost',
            'Loss (all years) (ha)',
            'Tree Cover Extent (2000) (ha)',
          ],
        },
        'AAT Argentina Polygons Generic_sensitive_areas_loss_forests.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Data Layer Name',
            'Forest Loss (ha)',
            'Year',
            'Loss (all years) (ha)',
            '% of TCL',
          ],
        },
        'AAT Argentina Polygons Generic_sensitive_areas_loss_of_forests_aggregate.csv': {
          columns: [
            'List Name',
            'Data Layer Name',
            'Forest Loss (ha)',
            'Year',
            'Loss (all years) (ha)',
            '% of TCL',
          ],
        },
        'AAT Argentina Polygons Generic_argentina_overlap_aggregate.csv': {
          columns: [
            'List Name',
            'Data Layer',
            'Sub-Layer',
            'Overlap with Sub-layer (Ha)',
            'Overlap with Sub-Layer (%)',
          ],
        },
        'AAT Argentina Polygons Generic_south_america_loss_of_forests.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Data Layer Name',
            'Forest Loss (ha)',
            'Year',
            'Loss (all years) (ha)',
            '% of TCL',
          ],
        },
        'README.csv': { isReadme: true },
      };

      const { apiResponse, zip } = await pollApiUntilComplete(
        `${BASE_URL}/api/v1/list/${list}/analysis/FCD/status`,
        {
          headers: {
            'x-api-key': API_TOKEN,
          },
        },
        2000,
        120000
      );

      expect(apiResponse.status).toBe('Completed');
      expect(apiResponse.listId).toBe(list);

      validateZipContents(zip, expectedFiles);
    },
    150 * 1000
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
        console.error('endpoints error', error.stack || error, error?.response?.data);
        throw error;
      }
    },
    30 * 1000
  );

  it(
    'should validate CSV zip bundle has expected files',
    async () => {
      const expectedFiles: Record<string, FileExpectation> = {
        'AAT Argentina Polygons Generic.json': {},
      };

      const { apiResponse, zip } = await pollApiUntilComplete(
        `${BASE_URL}/api/v1/list/${list}/analysis/DefReport/status`,
        {
          headers: {
            'x-api-key': API_TOKEN,
          },
        },
        5000,
        300000
      );

      expect(apiResponse.status).toBe('Completed');
      expect(apiResponse.listId).toBe(list);

      validateZipContents(zip, expectedFiles);
    },
    320 * 1000
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
        console.error('endpoints error', error.stack || error, error?.response?.data);
        throw error;
      }
    },
    30 * 1000
  );

  it(
    'should validate CSV zip bundle has expected files and columns',
    async () => {
      const expectedFiles: Record<string, FileExpectation> = {
        'AAT Argentina Polygons Generic_Global_Integrated_Disturbance_Alerts_Daily.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Location Size (ha)',
            'Country',
            'State',
            'Sub state',
            'Alert Type',
            'Start Date',
            'End Date',
            'Date',
            'Confidence Level',
            'Total alert hectares',
            'Hectares of alerts in SBTN Natural Forest',
            'Hectares of alerts in SBTN Natural Open Ecosystems',
            'Hectares of alerts in JRC Forest',
            'Number of locations',
          ],
        },
        'AAT Argentina Polygons Generic_IntegratedAlerts_NaturalForest_Daily.csv': {
          columns: [
            'List Name',
            'Location Name',
            'Alert Type',
            'Start Date',
            'End Date',
            'Date',
            'Location Size (HA)',
            'Confidence Level',
            'Total # of alerts',
            '# Alerts in SBTN Natural Forest',
            '# Alerts in JRC Natural Forest',
            '# of locations',
          ],
        },
        'README.csv': { isReadme: true },
      };

      const { apiResponse, zip } = await pollApiUntilComplete(
        `${BASE_URL}/api/v1/list/${list}/analysis/Alerts/status`,
        {
          headers: {
            'x-api-key': API_TOKEN,
          },
        },
        2000,
        120000
      );

      expect(apiResponse.status).toBe('Completed');
      expect(apiResponse.listId).toBe(list);

      validateZipContents(zip, expectedFiles);
    },
    150 * 1000
  );
});

describe.skip('Validate CSV Files for GHG', () => {
  it(
    'should generate GHG download',
    async () => {
      try {
        const res = await postRedirectHeaders(
          `${BASE_URL}/api/v1/list/${ghgList}/analysis/GHG/generate`,
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
        console.error('GHG/generate error', error.stack || error, error?.response?.data);
        throw error;
      }
    },
    30 * 1000
  );

  it(
    'should validate CSV bundle file has expected files and columns',
    async () => {
      const listName = 'GHG Analysis List';
      const expectedFiles: Record<string, FileExpectation> = {
        [`${listName}_green_house_gas_emissions.csv`]: {
          columns: ['Location Name', 'Year', 'CO2 Emissions (Mg)', 'CO2 Emissions (%)'],
        },
        'README.csv': { isReadme: true },
      };

      const { apiResponse, zip } = await pollApiUntilComplete(
        `${BASE_URL}/api/v1/list/${ghgList}/analysis/GHG/status`,
        {
          headers: {
            'x-api-key': API_TOKEN,
          },
        },
        2000,
        120000
      );

      expect(apiResponse.status).toBe('Completed');
      expect(apiResponse.listId).toBe(ghgList);

      validateZipContents(zip, expectedFiles);
    },
    150 * 1000
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
  zip: AdmZip;
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

    const response = await axios.get(url, {
      ...options,
      validateStatus: (status) => status < 500,
    });

    if (response.status >= 400) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse = response.data;

    if (result.status === 'Completed') {
      if (!result.resultUrl || !/^https?:\/\//.test(result.resultUrl)) {
        throw new Error(`Invalid or missing resultUrl: ${result.resultUrl}`);
      }

      const zipResponse = await axios.get(result.resultUrl, {
        headers: {
          'x-api-key': process.env.API_TOKEN,
        },
        responseType: 'arraybuffer',
        validateStatus: (status) => status < 500,
      });

      if (zipResponse.status >= 400) {
        throw new Error(`Failed to download zip file: ${zipResponse.status}`);
      }

      const arrayBuffer = zipResponse.data;

      if (arrayBuffer.byteLength === 0) {
        throw new Error('Downloaded zip file is empty');
      }

      const zip = new AdmZip(Buffer.from(arrayBuffer));
      const zipEntries = zip.getEntries();

      if (zipEntries.length === 0) {
        throw new Error('Zip file contains no files');
      }

      return {
        apiResponse: result,
        zip,
      };
    } else if (result.status === 'Failed') {
      throw new Error(`API request failed: ${JSON.stringify(result)}`);
    }

    console.log(`Status: ${result.status}. Polling again in ${pollIntervalMs}ms...`);
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

function validateZipContents(zip: AdmZip, expectedFiles: Record<string, FileExpectation>): void {
  const zipEntries = zip.getEntries();
  const zipFileNames = zipEntries
    .map((entry) => entry.entryName)
    .filter((name) => !name.endsWith('/'));

  expect(zipFileNames.sort()).toEqual(Object.keys(expectedFiles).sort());

  for (const [fileName, expectation] of Object.entries(expectedFiles)) {
    const entry = zipEntries.find((e) => e.entryName === fileName);
    expect(entry).toBeDefined();

    if (!entry) {
      continue;
    }

    const content = entry.getData().toString('utf8');

    if (expectation.isReadme) {
      // README exists and is parseable
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
      expect(parsed.data.length).toBeGreaterThan(0);
      console.log('README.csv validated');
    } else if (expectation.columns) {
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
      expect(parsed.data.length).toBeGreaterThan(0);

      const actualColumns = parsed.meta.fields || [];
      expect(actualColumns).toEqual(expectation.columns);
      console.log(`${fileName}: columns validated`);
    }
  }
}
