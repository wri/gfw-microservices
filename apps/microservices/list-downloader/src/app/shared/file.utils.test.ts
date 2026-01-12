import { getAllFilesAndZip, createDirectory } from './file.utils';
import * as fs from 'fs';
import * as path from 'path';

describe('getAllFilesAndZip', () => {
  const testDir = '/tmp/wri-test-zip';
  const testKey = 'test-zip-key';
  const testListName = 'PalmRiskTest';
  const testCsv = `${testListName}_palm_risk_analysis.csv`;
  const testReadme = 'README.csv';
  const testZip = `/tmp/${testKey}.zip`;
  const targetDir = `/tmp/wri-${testKey}`;

  beforeAll(() => {
    createDirectory(testDir);
    fs.writeFileSync(path.join(testDir, testCsv), 'header1,header2\n0,Low\n');
    fs.writeFileSync(path.join(testDir, testReadme), 'header\nvalue\n');
  });

  afterAll(() => {
    // Clean up both directories in case the test fails at different stages
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    if (fs.existsSync(testZip)) {
      fs.unlinkSync(testZip);
    }
  });

  it('should include Palm Risk Analysis CSV in the zip even if values are zero', async () => {
    const filter = { key: testKey, listName: testListName };
    // Remove target directory if it exists to avoid ENOTEMPTY error
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    // Move test files to expected location
    fs.renameSync(testDir, targetDir);
    await getAllFilesAndZip(filter);
  // Check zip file exists
  expect(fs.existsSync(testZip)).toBe(true);
  // Check zip contents
  const zipContent = fs.readFileSync(testZip);
  expect(zipContent.length).toBeGreaterThan(0);

  // Use adm-zip to inspect contents
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipContent);
  const entries = zip.getEntries();
  // Find Palm Risk Analysis CSV by the actual filename pattern
  const palmCsvEntry = entries.find(e => e.entryName.includes('palm_risk_analysis.csv'));
  expect(palmCsvEntry).toBeDefined();
  const csvContent = palmCsvEntry.getData().toString('utf8');
  // Check that the CSV contains the expected row with 0 value and 'Low'
  expect(csvContent).toMatch(/0,Low/);
  // Optionally, check for header and exact row
  expect(csvContent).toMatch(/header1,header2\n0,Low/);
  });
});
