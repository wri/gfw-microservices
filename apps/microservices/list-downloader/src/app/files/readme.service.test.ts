import { Test, TestingModule } from '@nestjs/testing';
import { ReadmeService } from './readme.service';
import * as fs from 'fs';
import * as path from 'path';
import { AlertFieldsFileRequest, BasicFieldsFileRequest } from '@wri-monorepos/sql';

jest.mock('fs');
jest.mock('path');

describe('ReadmeService', () => {
  let service: ReadmeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadmeService],
    }).compile();

    service = module.get<ReadmeService>(ReadmeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should source dir have afi_readme when the filter type is AFI', async () => {
    const filters: BasicFieldsFileRequest = { type: 'afi', key: 'test-key' };
    const sourceDir = '/mock/source/dir/afi_readme.csv';
    const destFile = '/tmp/wri-test-key/README.csv';

    const error = new Error('Copy failed');
    (fs.copyFile as unknown as jest.Mock).mockImplementation((src, dest, callback) => {
      callback(error);
    });
    await service.write(filters);
    expect(fs.copyFile).toHaveBeenCalledWith(sourceDir, destFile, expect.any(Function));
  });

  it('should source dir have daily_alerts_readme when the filter type is Alerts and the selectedTimeFrame is Day ', async () => {
    const filters: AlertFieldsFileRequest = {
      key: 'test-key',
      type: 'alerts',
      selectedTimeframe: 'DAY',
      selectedAlert: '',
    };
    const sourceDir = '/mock/source/dir/daily_alerts_readme.csv';
    const destFile = '/tmp/wri-test-key/README.csv';

    (fs.copyFile as unknown as jest.Mock).mockImplementation((src, dest, callback) => {
      callback(null);
    });
    await service.write(filters);
    expect(fs.copyFile).toHaveBeenCalledWith(sourceDir, destFile, expect.any(Function));
  });

  it('should not break when readme file dont exist', async () => {
    const filters: BasicFieldsFileRequest = {
      type: 'test-wri',
      key: 'test-key',
    };
    const sourceDir = '/mock/source/dir/daily_alerts_readme.md';
    const destDir = '/tmp/wri-test-key';
    const destFile = '/tmp/wri-test-key/README.md';

    (path.join as jest.Mock)
      .mockReturnValueOnce(sourceDir)
      .mockReturnValueOnce(destDir)
      .mockReturnValueOnce(destFile);

    (fs.copyFile as unknown as jest.Mock).mockImplementation((src, dest, callback) => {
      callback(null);
    });
    await service.write(filters);

    expect(fs.copyFile).not.toHaveBeenCalled();
  });
});
