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
    },
    30 * 1000
  );

  it(
    'should validate CSV zip bundle has expected files and columns',
    async () => {
      const expectedFiles: Record<string, FileExpectation> = {
        'AAT Argentina Polygons Generic_argentina_loss_of_forests.csv': {
          columns: ['Location Name', 'Year', 'Tree cover loss (ha)', 'Tree cover loss (%)'],
        },
        'AAT Argentina Polygons Generic_argentina_loss_of_forests_aggregate.csv': {
          columns: ['Year', 'Tree cover loss (ha)', 'Tree cover loss (%)'],
        },
        'AAT Argentina Polygons Generic_argentina_overlap.csv': {
          columns: ['Location Name', 'Year', 'Tree cover extent (ha)', 'Tree cover extent (%)'],
        },
        'AAT Argentina Polygons Generic_argentina_overlap_aggregate.csv': {
          columns: ['Year', 'Tree cover extent (ha)', 'Tree cover extent (%)'],
        },
        'AAT Argentina Polygons Generic_forest_change_diagnostic_list_summary.csv': {
          columns: ['Metric', 'Value'],
        },
        'AAT Argentina Polygons Generic_forest_change_diagnostic_location_summary.csv': {
          columns: ['Location Name', 'Metric', 'Value'],
        },
        'AAT Argentina Polygons Generic_sensitive_areas_loss_forests.csv': {
          columns: ['Location Name', 'Year', 'Tree cover loss (ha)', 'Tree cover loss (%)'],
        },
        'AAT Argentina Polygons Generic_sensitive_areas_loss_of_forests_aggregate.csv': {
          columns: ['Year', 'Tree cover loss (ha)', 'Tree cover loss (%)'],
        },
        'AAT Argentina Polygons Generic_sensitive_areas_percentage_historic_area_lost_aggregate.csv':
          {
            columns: ['Year', 'Percentage of historic area lost (%)'],
          },
        'AAT Argentina Polygons Generic_sensitive_areas_percentage_historic_area_lost.csv': {
          columns: ['Location Name', 'Year', 'Percentage of historic area lost (%)'],
        },
        'AAT Argentina Polygons Generic_south_america_loss_of_forests.csv': {
          columns: ['Location Name', 'Year', 'Tree cover loss (ha)', 'Tree cover loss (%)'],
        },
        'AAT Argentina Polygons Generic_south_america_loss_of_forests_aggregate.csv': {
          columns: ['Year', 'Tree cover loss (ha)', 'Tree cover loss (%)'],
        },
        'AAT Argentina Polygons Generic_south_america_overlap.csv': {
          columns: ['Location Name', 'Year', 'Tree cover extent (ha)', 'Tree cover extent (%)'],
        },
        'AAT Argentina Polygons Generic_south_america_overlap_aggregate.csv': {
          columns: ['Year', 'Tree cover extent (ha)', 'Tree cover extent (%)'],
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
        2000,
        120000
      );

      expect(apiResponse.status).toBe('Completed');
      expect(apiResponse.listId).toBe(list);

      const zipFileNames = zip
        .getEntries()
        .map((entry) => entry.entryName)
        .filter((name) => !name.endsWith('/'));

      expect(zipFileNames.sort()).toEqual(Object.keys(expectedFiles).sort());
    },
    150 * 1000
  );
});

describe('Validate CSV Files for Alerts', () => {
  it(
    'should generate Alerts analysis file',
    async () => {
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
    },
    30 * 1000
  );

  it(
    'should validate CSV zip bundle has expected files and columns',
    async () => {
      const expectedFiles: Record<string, FileExpectation> = {
        'AAT Argentina Polygons Generic_IntegratedAlerts_NaturalForest_Daily.csv': {
          columns: ['Location Name', 'Date', 'Alert Count', 'Alert Area (ha)'],
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

describe('Validate CSV Files for GHG', () => {
  it(
    'should generate GHG download',
    async () => {
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

  let readmeColumns: string[] = [];

  for (const [fileName, expectation] of Object.entries(expectedFiles)) {
    const entry = zipEntries.find((e) => e.entryName === fileName);
    expect(entry).toBeDefined();

    if (!entry) continue;

    const content = entry.getData().toString('utf8');

    if (expectation.isReadme) {
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
      readmeColumns = parsed.data.map((row: any) => row.Column);
      console.log('README columns found:', readmeColumns);
    } else if (expectation.columns) {
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
      expect(parsed.data.length).toBeGreaterThan(0);

      const actualColumns = parsed.meta.fields || [];
      expect(actualColumns).toEqual(expectation.columns);
      console.log(`${fileName}: columns validated`);
    }
  }

  // Verify README contains column names from data CSVs
  if (readmeColumns.length > 0) {
    for (const [fileName, expectation] of Object.entries(expectedFiles)) {
      if (expectation.columns && !expectation.isReadme) {
        for (const column of expectation.columns) {
          expect(readmeColumns).toContain(column);
        }
      }
    }
    console.log('README verification: all data CSV columns documented');
  }
}