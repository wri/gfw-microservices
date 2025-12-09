import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

import {
  AlertFieldsFileRequest,
  AlertsTimeframes,
  BasicFieldsFileRequest,
  ListFieldsFileRequest,
} from '@wri-monorepos/sql';
import { ReadmeService } from './readme.service';
import { ReadmeMergeServices } from '../shared/readme.merge.service';

jest.mock('fs');
jest.mock('path', () => ({
  ...jest.requireActual('path'), // Use actual 'path' methods except the one(s) mocked below
  resolve: jest.fn((...args) => '/mock/source/dir/' + args[args.length - 1]),
  join: jest.fn((...args) => args.join('/')),
}));

describe('ReadmeService', () => {
  let service: ReadmeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [ReadmeService, ReadmeMergeServices],
    }).compile();

    service = await module.resolve<ReadmeService>(ReadmeService);
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

  it('should merge daily_alerts_readme and global_integrated_disturbance_alerts_daily_readme when the filter type is Alerts and the selectedTimeFrame is Day', async () => {
    const filters: AlertFieldsFileRequest = {
      key: 'test-key',
      type: 'alerts',
      selectedTimeframe: AlertsTimeframes.DAY,
      selectedAlert: '',
      listName: 'TestList',
    };

    // Access the readmeMergeServices instance from the service
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceReadmeMergeServices = (service as any).readmeMergeServices;
    const processFilesSpy = jest
      .spyOn(serviceReadmeMergeServices, 'processFiles')
      .mockResolvedValue('/tmp/wri-test-key/README.csv');

    await service.write(filters);

    expect(processFilesSpy).toHaveBeenCalledWith(
      [
        '/mock/source/dir/daily_alerts_readme.csv',
        '/mock/source/dir/global_integrated_disturbance_alerts_daily_readme.csv',
      ],
      null,
      '/tmp/wri-test-key/',
      'TestList'
    );
    expect(fs.copyFile).not.toHaveBeenCalled();
  });

  it('should not break when readme file does not exist', async () => {
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

  it('should return array with daily_alerts_readme.csv and global_integrated_disturbance_alerts_daily_readme.csv when selectedTimeframe is DAY', () => {
    const filters: AlertFieldsFileRequest = {
      key: 'test-key',
      type: 'alerts',
      selectedTimeframe: AlertsTimeframes.DAY,
      selectedAlert: '',
    };

    const result = service.alertsReadmeData(filters);

    expect(result).toEqual([
      'daily_alerts_readme.csv',
      'global_integrated_disturbance_alerts_daily_readme.csv',
    ]);
  });

  it('should return alerts_readme.csv when selectedTimeframe is WEEK', () => {
    const filters: AlertFieldsFileRequest = {
      key: 'test-key',
      type: 'alerts',
      selectedTimeframe: AlertsTimeframes.WEEK,
      selectedAlert: '',
    };

    const result = service.alertsReadmeData(filters);

    expect(result).toBe('alerts_readme.csv');
  });

  it('should return alerts_readme.csv when selectedTimeframe is MONTH', () => {
    const filters: AlertFieldsFileRequest = {
      key: 'test-key',
      type: 'alerts',
      selectedTimeframe: AlertsTimeframes.MONTH,
      selectedAlert: '',
    };

    const result = service.alertsReadmeData(filters);

    expect(result).toBe('alerts_readme.csv');
  });

  it('should return alerts_readme.csv when selectedTimeframe is QUARTER', () => {
    const filters: AlertFieldsFileRequest = {
      key: 'test-key',
      type: 'alerts',
      selectedTimeframe: AlertsTimeframes.QUARTER,
      selectedAlert: '',
    };

    const result = service.alertsReadmeData(filters);

    expect(result).toBe('alerts_readme.csv');
  });

  it('should return alerts_readme.csv when selectedTimeframe is YEAR', () => {
    const filters: AlertFieldsFileRequest = {
      key: 'test-key',
      type: 'alerts',
      selectedTimeframe: AlertsTimeframes.YEAR,
      selectedAlert: '',
    };

    const result = service.alertsReadmeData(filters);

    expect(result).toBe('alerts_readme.csv');
  });

  it('should return everything_commodity_risk_readme.csv when listView is commodity_risk', () => {
    const filters: ListFieldsFileRequest = {
      key: 'test-key',
      listView: 'commodity_risk',
      type: 'everything',
    };

    const result = service.everythingBundleReadmeData(filters);

    expect(result).toBe('everything_commodity_risk_readme.csv');
  });

  it('should return undefined when listView does not match any key in listsViews', () => {
    const filters: ListFieldsFileRequest = {
      key: 'test-key',
      listView: 'non_existent_view',
      type: 'everything',
    };

    const result = service.everythingBundleReadmeData(filters);

    expect(result).toBeUndefined();
  });

  it('should return forest_change_south_east_asia_readme.csv when listView is forest_change', () => {
    const filters: ListFieldsFileRequest = {
      key: 'test-key',
      listView: 'forest_change',
      type: 'southEastAsiaTCL',
    };

    const result = service.southEastAsiaTCL(filters);

    expect(result).toBe('forest_change_south_east_asia_readme.csv');
  });

  it('should return forest_change_south_east_asia_readme.csv when listView does not match any key in southEastAsiaTCL listsViews', () => {
    const filters: ListFieldsFileRequest = {
      key: 'test-key',
      listView: 'non_existent_view',
      type: 'southEastAsiaTCL',
    };

    const result = service.southEastAsiaTCL(filters);

    expect(result).toBe('forest_change_south_east_asia_readme.csv');
  });

  it('should return argentina_forest_change_readme.csv when listView is forest_change', () => {
    const filters: ListFieldsFileRequest = {
      key: 'test-key',
      listView: 'forest_change',
      type: 'argentina',
    };

    const result = service.countrySpecificReadmeData(filters, 'argentina');
    expect(result).toBe('argentina_forest_change_readme.csv');
  });

  it('should return colombia_forest_change_readme.csv when listView is forest_change', () => {
    const filters: ListFieldsFileRequest = {
      key: 'test-key',
      listView: 'forest_change',
      type: 'colombia',
    };

    const result = service.countrySpecificReadmeData(filters, 'colombia');
    expect(result).toBe('colombia_forest_change_readme.csv');
  });

  it('should return south_america_forest_change_readme.csv when listView is forest_change', () => {
    const filters: ListFieldsFileRequest = {
      key: 'test-key',
      listView: 'forest_change',
      type: 'south_america',
    };

    const result = service.countrySpecificReadmeData(filters, 'south_america');
    expect(result).toBe('south_america_forest_change_readme.csv');
  });
});
