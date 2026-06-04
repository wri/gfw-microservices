import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import * as sqlModule from '@wri-monorepos/sql';

jest.mock('@wri-monorepos/sql', () => ({
  ...jest.requireActual('@wri-monorepos/sql'),
  getAccountUsersAnalysisUsageExportWithTokenization: jest.fn(),
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
    mockGetExport = sqlModule.getAccountUsersAnalysisUsageExportWithTokenization as jest.Mock;
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

    it('maps token columns (Location Rate, List Rate, Token Usage, Total Tokens, Effective Rate Date)', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '42',
          'Analysis Types': 'AFI',
          Hectares: 100,
          Locations: 10,
          'Location Rate': 0.32,
          'List Rate': 1.0,
          'Token Usage (Locations)': 3.2,
          'Token Usage (Lists)': 1.0,
          'Total Tokens': 4.2,
          'Effective Rate Date': '24 Nov 2025',
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
        '1',
        '3.2',
        '1',
        '4.2',
        '24 Nov 2025',
        '24 Mar 2026 12:00:00 GMT',
        'UI',
      ]);
    });

    it('renders null token values as empty strings', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '1',
          'Analysis Types': 'ALERTS',
          Hectares: 50,
          Locations: 5,
          'Location Rate': null,
          'List Rate': null,
          'Token Usage (Locations)': null,
          'Token Usage (Lists)': null,
          'Total Tokens': null,
          'Effective Rate Date': null,
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'API',
        },
      ]);

      expect(rows[0][5]).toBe('');
      expect(rows[0][6]).toBe('');
      expect(rows[0][7]).toBe('');
      expect(rows[0][8]).toBe('');
      expect(rows[0][9]).toBe('');
      expect(rows[0][10]).toBe('');
    });

    it('labels ALERTS-BATCH as Weekly Alerts', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '1',
          'Analysis Types': 'ALERTS-BATCH',
          Hectares: 0,
          Locations: 10,
          'Location Rate': 0.1,
          'List Rate': 0,
          'Token Usage (Locations)': 1.0,
          'Token Usage (Lists)': 0,
          'Total Tokens': 1.0,
          'Effective Rate Date': '24 Nov 2025',
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
          'Analysis Types': 'GHG',
          Hectares: 100,
          Locations: 10,
          'Location Rate': 0.5,
          'List Rate': 2.0,
          'Token Usage (Locations)': 5.0,
          'Token Usage (Lists)': 2.0,
          'Total Tokens': 7.0,
          'Effective Rate Date': '24 Nov 2025',
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'UI',
        },
      ]);

      expect(rows[0][2]).toBe('GHG Emissions');
    });

    it('labels comma-separated analysis types individually', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'user@example.com',
          'List ID': '1',
          'Analysis Types': 'AFI,FCD',
          Hectares: 100,
          Locations: 10,
          'Location Rate': 0.32,
          'List Rate': 1.0,
          'Token Usage (Locations)': 3.2,
          'Token Usage (Lists)': 1.0,
          'Total Tokens': 4.2,
          'Effective Rate Date': '24 Nov 2025',
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'UI',
        },
      ]);

      expect(rows[0][2]).toBe('Post-2020 Risk Assessment, Post-2000 Forest Change');
    });

    it('maps multiple rows correctly', async () => {
      const rows = await callGetFileContents([
        {
          Username: 'a@example.com',
          'List ID': '1',
          'Analysis Types': 'AFI',
          Hectares: 10,
          Locations: 5,
          'Location Rate': 0.32,
          'List Rate': 1.0,
          'Token Usage (Locations)': 1.6,
          'Token Usage (Lists)': 1.0,
          'Total Tokens': 2.6,
          'Effective Rate Date': '24 Nov 2025',
          'Date/Timestamp': '01 Jan 2026 00:00:00 GMT',
          'UI/API': 'UI',
        },
        {
          Username: 'b@example.com',
          'List ID': '2',
          'Analysis Types': 'FCD',
          Hectares: 20,
          Locations: 3,
          'Location Rate': 0.25,
          'List Rate': 1.0,
          'Token Usage (Locations)': 0.75,
          'Token Usage (Lists)': 1.0,
          'Total Tokens': 1.75,
          'Effective Rate Date': '24 Nov 2025',
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
