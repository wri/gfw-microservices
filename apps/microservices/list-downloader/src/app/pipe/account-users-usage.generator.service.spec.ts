import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import * as sqlModule from '@wri-monorepos/sql';

jest.mock('@wri-monorepos/sql', () => ({
  ...jest.requireActual('@wri-monorepos/sql'),
  getAccountUsersAnalysisUsageExport: jest.fn(),
}));

jest.mock('csv-write-stream', () => {
  return jest.fn(() => ({
    pipe: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
  }));
});

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
  createWriteStream: jest.fn(() => ({
    on: jest.fn((event, cb) => {
      if (event === 'finish') {
        setTimeout(cb, 0);
      }
    }),
  })),
}));

describe('AccountUsersAnalysisUsageFileService', () => {
  let service: AccountUsersAnalysisUsageFileService;
  let mockGetExport: jest.Mock;

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockS3Service = {
    writeFileToS3: jest.fn().mockResolvedValue(undefined),
    getFileSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/file.csv'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'SES_SENDER_EMAIL') {
        return 'test@example.com';
      }
      if (key === 'AWS_TMP_BUCKET') {
        return 'test-bucket';
      }
      return '';
    }),
  };

  beforeEach(async () => {
    mockGetExport = sqlModule.getAccountUsersAnalysisUsageExport as jest.Mock;
    mockGetExport.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountUsersAnalysisUsageFileService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AccountUsersAnalysisUsageFileService>(
      AccountUsersAnalysisUsageFileService
    );
  });

  describe('getFileContents', () => {
    const callGetFileContents = (data: Record<string, unknown>[]) => {
      mockGetExport.mockResolvedValue(data);
      return (service as any).getFileContents({
        organizationDatabase: 'org-123',
        startDate: '2026-01-01',
        endDate: '2026-03-01',
      });
    };

    it('maps Per Location Cost, Processing Cost, and Total Cost columns', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '42',
          'Analysis Type': 'AFI',
          Hectares: 100,
          Locations: 10,
          'Per Location Cost': 0.32,
          'Processing Cost': 5.0,
          'Total Cost': 8.2,
          'Date/Timestamp': '24 Mar 2026 12:00:00 GMT',
          'UI/API': 'UI',
        },
      ]);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual([
        'user@example.com',
        '42',
        'Post-2020 Risk Assessment',
        '100',
        '10',
        '0.32',
        '5',
        '8.2',
        '24 Mar 2026 12:00:00 GMT',
        'UI',
      ]);
    });

    it('defaults null cost values to 0', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '1',
          'Analysis Type': 'ALERTS',
          Hectares: 50,
          Locations: 5,
          'Per Location Cost': null,
          'Processing Cost': null,
          'Total Cost': null,
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'API',
        },
      ]);

      expect(rows[0][5]).toBe('0');
      expect(rows[0][6]).toBe('0');
      expect(rows[0][7]).toBe('0');
    });

    it('labels ALERTS-BATCH as Weekly Alerts', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '1',
          'Analysis Type': 'ALERTS-BATCH',
          Hectares: 0,
          Locations: 10,
          'Per Location Cost': 0.1,
          'Processing Cost': 0,
          'Total Cost': 1.0,
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'UI',
        },
      ]);

      expect(rows[0][2]).toBe('Weekly Alerts');
    });

    it('labels GHG as GHG Emissions', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '1',
          'Analysis Type': 'GHG',
          Hectares: 100,
          Locations: 10,
          'Per Location Cost': 0.5,
          'Processing Cost': 2.0,
          'Total Cost': 7.0,
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'UI',
        },
      ]);

      expect(rows[0][2]).toBe('GHG Emissions');
    });

    it('maps multiple rows correctly', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'a@example.com',
          'List ID': '1',
          'Analysis Type': 'AFI',
          Hectares: 10,
          Locations: 5,
          'Per Location Cost': 0.32,
          'Processing Cost': 5.0,
          'Total Cost': 6.6,
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'UI',
        },
        {
          Username: 'b@example.com',
          'List ID': '2',
          'Analysis Type': 'FCD',
          Hectares: 20,
          Locations: 3,
          'Per Location Cost': 0.25,
          'Processing Cost': 4.0,
          'Total Cost': 4.75,
          'Date/Timestamp': '02 Jan 2026 00:00:00 GMT',
          'UI/API': 'API',
        },
      ]);

      expect(rows).toHaveLength(2);
      expect(rows[0][0]).toBe('a@example.com');
      expect(rows[1][0]).toBe('b@example.com');
      expect(rows[1][2]).toBe('Post-2000 Forest Change');
    });
  });
});
