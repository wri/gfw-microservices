import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailService } from '@wri-monorepos/aws';
import { listStatus } from '@wri-monorepos/constants';
import { UspResetListStatus } from '@wri-monorepos/sql';
import { setListAnalysisStatus } from '@wri-monorepos/geo';

import { PutListAsDraft } from './put.list.as.draft';
import { getUserEmail } from '../shared/user.utils';
import { ChainType, RequestNewList } from './types';

jest.mock('@wri-monorepos/sql');
jest.mock('@wri-monorepos/geo');
jest.mock('../shared/user.utils');

interface ServerConfigType {
  SES_SENDER_EMAIL?: string;
  NODE_ENV?: 'test' | 'development' | 'staging' | 'qa' | 'ProdV2';
}

describe('PutListAsDraft', () => {
  let service: PutListAsDraft;
  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };
  const mockConfigService: Partial<ConfigService<ServerConfigType, true>> = {
    get: jest.fn((key: keyof ServerConfigType) => {
      if (key === 'SES_SENDER_EMAIL') {
        return 'test@example.com';
      }
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env', '.env.test'],
        }),
      ],
      providers: [
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PutListAsDraft,
          useFactory: () =>
            new PutListAsDraft(
              mockConfigService as ConfigService<ServerConfigType, true>,
              mockEmailService as unknown as EmailService
            ),
        },
      ],
    }).compile();

    service = module.get<PutListAsDraft>(PutListAsDraft);
  });

  describe('handle', () => {
    it('should return input unchanged when saveAsDraft is true', async () => {
      const input: ChainType = {
        request: {
          saveAsDraft: true,
          organization_database: 'test_db',
          list_id: 123,
          isExternalAPIProcess: false,
          organization_id: 1,
          subscription_status_id: 1,
          hasUnanalyzableError: false,
          path: '/test/path',
        } as RequestNewList,
      };

      const result = await service.handle(input);

      expect(result).toEqual(input);
    });

    it('should return input unchanged when hasUnanalyzableError is false', async () => {
      const input: ChainType = {
        request: {
          saveAsDraft: false,
          hasUnanalyzableError: false,
          organization_database: 'test_db',
          list_id: 123,
          isExternalAPIProcess: false,
          organization_id: 1,
          subscription_status_id: 1,
          path: '/test/path',
        } as RequestNewList,
      };

      const result = await service.handle(input);

      expect(result).toEqual(input);
    });

    it('should handle unanalyzable error and send email notification', async () => {
      const mockUserEmail = 'user@example.com';
      (getUserEmail as jest.Mock).mockResolvedValue(mockUserEmail);
      (UspResetListStatus.prototype.run as jest.Mock).mockResolvedValue(undefined);
      (setListAnalysisStatus as jest.Mock).mockResolvedValue(undefined);

      const input: ChainType = {
        request: {
          saveAsDraft: false,
          hasUnanalyzableError: true,
          organization_database: 'test_db',
          list_id: 123,
          user_id: 456,
          analysisIds: ['analysis1'],
          list_name: 'Test List',
          isExternalAPIProcess: false,
          organization_id: 1,
          subscription_status_id: 1,
          path: '/test/path',
        } as RequestNewList,
      };

      const result = await service.handle(input);

      expect(UspResetListStatus.prototype.run).toHaveBeenCalledWith(
        'test_db',
        123,
        listStatus.Draft,
        undefined
      );
      expect(setListAnalysisStatus).toHaveBeenCalledWith(
        'test_db',
        123,
        ['analysis1'],
        listStatus.Draft,
        1,
        undefined
      );
      expect(getUserEmail).toHaveBeenCalledWith('test_db', 456);
      expect((result.request as RequestNewList).saveAsDraft).toBe(true);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        [mockUserEmail],
        'Error Submitting for Analysis',
        'listUploadError',
        { listName: 'Test List' }
      );
    });

    it('should not send email when isExternalAPIProcess is true', async () => {
      (UspResetListStatus.prototype.run as jest.Mock).mockResolvedValue(undefined);
      (setListAnalysisStatus as jest.Mock).mockResolvedValue(undefined);
      (getUserEmail as jest.Mock).mockResolvedValue('user@example.com'); // mock it here too

      const input: ChainType = {
        request: {
          saveAsDraft: false,
          hasUnanalyzableError: true,
          organization_database: 'test_db',
          list_id: 123,
          user_id: 456,
          analysisIds: ['analysis1'],
          list_name: 'Test List',
          isExternalAPIProcess: true, // this flag true disables email sending
          organization_id: 1,
          subscription_status_id: 1,
          path: '/test/path',
        } as RequestNewList,
      };

      const result = await service.handle(input);

      expect(UspResetListStatus.prototype.run).toHaveBeenCalled();
      expect(setListAnalysisStatus).toHaveBeenCalled();

      // getUserEmail IS called, but sendEmail is NOT called
      expect(getUserEmail).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect((result.request as RequestNewList).saveAsDraft).toBe(true);
    });

    it('should handle email sending failure gracefully', async () => {
      const mockUserEmail = 'user@example.com';
      (getUserEmail as jest.Mock).mockResolvedValue(mockUserEmail);
      (UspResetListStatus.prototype.run as jest.Mock).mockResolvedValue(undefined);
      (setListAnalysisStatus as jest.Mock).mockResolvedValue(undefined);
      (mockEmailService.sendEmail as jest.Mock).mockRejectedValueOnce(new Error('Email failed'));

      const input: ChainType = {
        request: {
          saveAsDraft: false,
          hasUnanalyzableError: true,
          organization_database: 'test_db',
          list_id: 123,
          user_id: 456,
          analysisIds: ['analysis1'],
          list_name: 'Test List',
          isExternalAPIProcess: false,
          organization_id: 1,
          subscription_status_id: 1,
          path: '/test/path',
        } as RequestNewList,
      };

      const result = await service.handle(input);

      expect(UspResetListStatus.prototype.run).toHaveBeenCalled();
      expect(setListAnalysisStatus).toHaveBeenCalled();
      expect((result.request as RequestNewList).saveAsDraft).toBe(true);
    });
  });

  describe('putListAsDraft', () => {
    it('should call UspResetListStatus with correct parameters', async () => {
      (UspResetListStatus.prototype.run as jest.Mock).mockResolvedValue(undefined);

      await service.putListAsDraft('test_db', 123, 'gfw123');

      expect(UspResetListStatus.prototype.run).toHaveBeenCalledWith(
        'test_db',
        123,
        listStatus.Draft,
        'gfw123'
      );
    });
  });
});
