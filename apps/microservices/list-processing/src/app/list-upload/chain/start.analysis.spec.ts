import { StartAnalysis } from './start.analysis';
import { ClientStoreConnection, Lists, User } from '@wri-monorepos/sql';
import { handleCreateAnalysis } from '@wri-monorepos/geo';
import { listStatus } from '@wri-monorepos/constants';
import { ChainType } from './types';

// Mock external dependencies
jest.mock('@wri-monorepos/geo');
jest.mock('@wri-monorepos/sql');

describe('StartAnalysis', () => {
  let startAnalysis: StartAnalysis;
  let mockClientStoreConnection: jest.Mocked<ClientStoreConnection>;
  let mockConnection: any;
  let mockListRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock connection and repositories
    mockListRepository = {
      findOne: jest.fn(),
    };
    mockUserRepository = {
      findOne: jest.fn(),
    };
    mockConnection = {
      getRepository: jest.fn((entity) => {
        if (entity === Lists) {
          return mockListRepository;
        }
        if (entity === User) {
          return mockUserRepository;
        }
      }),
    };
    mockClientStoreConnection = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    } as any;

    startAnalysis = new StartAnalysis(mockClientStoreConnection as any);
  });

  const mockRequest = {
    request: {
      organization_database: 'test_db',
      user_id: 1,
      list_id: 123,
      isExternalAPIProcess: false,
      organization_id: 456,
      subscription_status_id: 1,
      saveAsDraft: false,
      analysisIds: ['analysis1', 'analysis2'],
      userEmail: 'test@example.com',
    },
    geojson: {
      features: [{ properties: { gadmid: '123', error: null } }],
    },
  } as unknown as ChainType;

  describe('handle', () => {
    it('should skip analysis for draft lists', async () => {
      mockListRepository.findOne.mockResolvedValue({ listStatusId: listStatus.Draft });

      const result = await startAnalysis.handle(mockRequest);

      expect(result).toBe(mockRequest);
      expect(handleCreateAnalysis).not.toHaveBeenCalled();
    });

    it('should throw error if all features have errors', async () => {
      mockListRepository.findOne.mockResolvedValue({ listStatusId: listStatus.Active });

      const requestWithErrors = {
        ...mockRequest,
        geojson: {
          features: [{ properties: { error: 'Some error' } }],
        },
      } as unknown as ChainType;

      await expect(startAnalysis.handle(requestWithErrors)).rejects.toThrow(
        'All the features have errors, not going to start the analysis'
      );
    });

    it('should create analysis successfully', async () => {
      process.env.MICROSERVICES_ENV = 'DEVELOPMENT';
      mockListRepository.findOne.mockResolvedValue({ listStatusId: listStatus.Active });
      (handleCreateAnalysis as jest.Mock).mockResolvedValue('OK');

      const result = await startAnalysis.handle(mockRequest);

      expect(handleCreateAnalysis).toHaveBeenCalledWith(
        'analysis1,analysis2', // analysisTypesToProcess
        123, // listId
        456, // organizationId
        'test_db', // organizationDatabase
        false, // don't send email (changed from true to false)
        1, // user_id
        1, // subscriptionStatusId
        false // last parameter (removed the extra 'false')
      );
      expect(result).toBe(mockRequest);
    });

    it('should throw error if analysis creation fails', async () => {
      process.env.MICROSERVICES_ENV = 'DEVELOPMENT';
      mockListRepository.findOne
        .mockResolvedValueOnce({ listStatusId: listStatus.Active })
        .mockResolvedValueOnce({ listName: 'normal_list' });
      mockUserRepository.findOne.mockResolvedValue({ email: 'normal@example.com' });
      (handleCreateAnalysis as jest.Mock).mockResolvedValue('Error');

      await expect(startAnalysis.handle(mockRequest)).rejects.toThrow(
        'Failed to start analysis: Error'
      );
    });
  });

  describe('helper methods', () => {
    it('should get list status correctly', async () => {
      mockListRepository.findOne.mockResolvedValue({ listStatusId: listStatus.Active });

      const status = await startAnalysis.getListStatus('test_db', 123);

      expect(status).toBe(listStatus.Active);
      expect(mockListRepository.findOne).toHaveBeenCalledWith({ where: { id: 123 } });
    });
  });
});
