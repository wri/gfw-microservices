import { PutListAsDraft } from './put.list.as.draft';
import { ChainType, RequestNewList } from './types';
import { ListsAnalysisStatus } from '@wri-monorepos/sql';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@wri-monorepos/aws';
import { getUserEmail } from '../shared/user.utils';

const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockGetRepository = jest.fn().mockImplementation(() => ({ update: mockUpdate }));
const mockGetConnection = jest.fn().mockReturnValue({ getRepository: mockGetRepository });
const mockConfig = {
  get: jest.fn().mockReturnValue('test@example.com'),
} as unknown as ConfigService;
const mockEmailService = {
  sendEmail: jest.fn(),
} as unknown as EmailService;

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: mockGetConnection,
  })),
  ListsAnalysisStatus: jest.fn(),
  UspResetListStatus: jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../shared/user.utils', () => ({
  getUserEmail: jest.fn().mockResolvedValue('user@example.com'),
}));

describe('PutListAsDraft', () => {
  let handler: PutListAsDraft;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new PutListAsDraft(mockConfig, mockEmailService);
  });

  it('should return input if saveAsDraft is true', async () => {
    const input: ChainType = {
      request: { saveAsDraft: true } as RequestNewList,
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
    expect(mockGetConnection).not.toHaveBeenCalled();
  });

  it('should update status to draft if hasUnanalyzableError is true', async () => {
    const input: ChainType = {
      request: {
        saveAsDraft: false,
        hasUnanalyzableError: true,
        organization_database: 'test_db',
        list_id: 123,
        user_id: 456,
        analysisIds: ['analysis1'],
        list_name: 'Test List',
      } as RequestNewList,
    };

    const loggerSpy = jest.spyOn(handler['logger'], 'error');
    const result = await handler.handle(input);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Should put list as draft, has invalid coordinates or polygon geometry'
    );

    expect(mockGetConnection).toHaveBeenCalledWith('test_db');
    expect(mockGetRepository).toHaveBeenCalledWith(ListsAnalysisStatus);
    expect(mockUpdate).toHaveBeenCalled();
    expect(getUserEmail).toHaveBeenCalledWith('test_db', 456);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      'test@example.com',
      ['user@example.com'],
      'Error Submitting for Analysis',
      'listUploadError',
      { listName: 'Test List' }
    );
    expect(result).toEqual({
      ...input,
      request: { ...input.request, saveAsDraft: true },
    });
  });

  it('should set saveAsDraft true but not update status if required fields are missing', async () => {
    const input: ChainType = {
      request: {
        saveAsDraft: false,
        hasUnanalyzableError: true,
        // missing organization_database and list_id
        user_id: 123,
      } as RequestNewList,
    };

    const result = await handler.handle(input);
    expect(mockGetConnection).not.toHaveBeenCalled();
    expect(result).toEqual({
      ...input,
      request: { ...input.request, saveAsDraft: true },
    });
  });

  it('should return input unchanged if hasUnanalyzableError is false', async () => {
    const input: ChainType = {
      request: {
        saveAsDraft: false,
        hasUnanalyzableError: false,
        organization_database: 'test_db',
        list_id: 123,
      } as RequestNewList,
    };

    const result = await handler.handle(input);
    expect(result).toBe(input);
    expect(mockGetConnection).not.toHaveBeenCalled();
  });
});
