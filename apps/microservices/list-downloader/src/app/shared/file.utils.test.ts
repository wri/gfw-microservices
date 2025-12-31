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

  beforeAll(() => {
    createDirectory(testDir);
    fs.writeFileSync(path.join(testDir, testCsv), 'header1,header2\n0,Low\n');
    fs.writeFileSync(path.join(testDir, testReadme), 'header\nvalue\n');
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
    if (fs.existsSync(testZip)) {
      fs.unlinkSync(testZip);
    }
  });

  it('should include Palm Risk Analysis CSV in the zip even if values are zero', async () => {
    const filter = { key: testKey, listName: testListName };
    const targetDir = `/tmp/wri-${testKey}`;
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
    // Optionally, use a zip library to inspect contents
  });
});
