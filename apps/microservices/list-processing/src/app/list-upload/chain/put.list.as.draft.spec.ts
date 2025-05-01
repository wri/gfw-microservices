import { ConfigService } from '@nestjs/config';
import { PutListAsDraft } from './put.list.as.draft';
import { EmailService } from '@wri-monorepos/aws';
import { listStatus } from '@wri-monorepos/constants';
import { UspResetListStatus } from '@wri-monorepos/sql';
import { setListAnalysisStatus } from '@wri-monorepos/geo';
import { getUserEmail } from '../shared/user.utils';
import { ChainType, RequestNewList } from './types';

jest.mock('@wri-monorepos/sql');
jest.mock('@wri-monorepos/geo');
jest.mock('../shared/user.utils');

describe('PutListAsDraft', () => {
  let service: PutListAsDraft;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test@example.com'),
  } as unknown as ConfigService;

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  } as unknown as EmailService;

  beforeEach(() => {
    service = new PutListAsDraft(mockConfigService, mockEmailService);
    jest.clearAllMocks();
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
        listStatus.Draft
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

      const input: ChainType = {
        request: {
          saveAsDraft: false,
          hasUnanalyzableError: true,
          organization_database: 'test_db',
          list_id: 123,
          user_id: 456,
          analysisIds: ['analysis1'],
          list_name: 'Test List',
          isExternalAPIProcess: true,
          organization_id: 1,
          subscription_status_id: 1,
          path: '/test/path',
        } as RequestNewList,
      };

      const result = await service.handle(input);

      expect(UspResetListStatus.prototype.run).toHaveBeenCalled();
      expect(setListAnalysisStatus).toHaveBeenCalled();
      expect(getUserEmail).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
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
