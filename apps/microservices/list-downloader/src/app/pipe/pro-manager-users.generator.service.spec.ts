import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProManagerUsersFileService } from './pro-manager-users.generator.service';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import * as sqlModule from '@wri-monorepos/sql';

jest.mock('@wri-monorepos/sql', () => ({
  ...jest.requireActual('@wri-monorepos/sql'),
  getProManagerUsersExport: jest.fn(),
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

describe('ProManagerUsersFileService', () => {
  let service: ProManagerUsersFileService;
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
    mockGetExport = sqlModule.getProManagerUsersExport as jest.Mock;
    mockGetExport.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProManagerUsersFileService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: S3Service, useValue: mockS3Service },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ProManagerUsersFileService>(ProManagerUsersFileService);
  });

  describe('getFileContents', () => {
    const callGetFileContents = (data: Record<string, unknown>[]) => {
      mockGetExport.mockResolvedValue(data);
      return (service as any).getFileContents();
    };

    it('maps user fields, resolves the access level and formats dates as DD MMM YYYY', async () => {
      const rows = await callGetFileContents([
        {
          first_name: 'Ada',
          last_name: 'Lovelace',
          email: 'ada@example.com',
          access_level_id: 1,
          organization_name: 'Analytical Engines',
          user_activated_time: '2026-09-23T00:00:00',
          deactivation_date: '2026-10-05T00:00:00',
          country: 'United Kingdom',
          language: 'EN',
        },
      ]);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual([
        'Ada',
        'Lovelace',
        'ada@example.com',
        'Administrator',
        'Analytical Engines',
        '23 Sep 2026',
        '05 Oct 2026',
        'United Kingdom',
        'EN',
      ]);
    });

    it('resolves Editor and Viewer access levels', async () => {
      const rows = await callGetFileContents([
        { first_name: 'Ed', access_level_id: 2 },
        { first_name: 'Vic', access_level_id: 3 },
      ]);

      expect(rows[0][3]).toBe('Editor');
      expect(rows[1][3]).toBe('Viewer');
    });

    it('leaves unknown access levels, missing values and invalid dates blank', async () => {
      const rows = await callGetFileContents([
        {
          first_name: 'No',
          last_name: 'Access',
          email: 'no@example.com',
          access_level_id: 99,
          organization_name: 'Org',
          user_activated_time: null,
          deactivation_date: undefined,
          country: null,
          language: null,
        },
      ]);

      expect(rows[0]).toEqual(['No', 'Access', 'no@example.com', '', 'Org', '', '', '', '']);
    });

    it('throws a descriptive error when the query fails', async () => {
      mockGetExport.mockRejectedValue(new Error('DB error'));
      await expect((service as any).getFileContents()).rejects.toThrow(
        '[getFileContents] Failed to get file contents. DB error'
      );
    });
  });

  describe('makeFile', () => {
    it('generates the file, uploads it and notifies the user on success', async () => {
      mockGetExport.mockResolvedValue([
        {
          first_name: 'Ada',
          last_name: 'Lovelace',
          email: 'ada@example.com',
          access_level_id: 1,
          organization_name: 'Org',
          user_activated_time: '2026-09-23T00:00:00',
        },
      ]);

      await service.makeFile({ userEmail: 'pm@example.com', key: 'ProManagerUsers-x.csv' });

      expect(mockS3Service.writeFileToS3).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        ['pm@example.com'],
        expect.any(String),
        'proManagerUsersExportSuccess',
        { location: 'https://s3.example.com/file.csv' }
      );
    });

    it('notifies the user of failure when generation throws', async () => {
      mockGetExport.mockRejectedValue(new Error('DB error'));

      await service.makeFile({ userEmail: 'pm@example.com', key: 'ProManagerUsers-x.csv' });

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        ['pm@example.com'],
        expect.any(String),
        'error',
        {}
      );
    });
  });
});
