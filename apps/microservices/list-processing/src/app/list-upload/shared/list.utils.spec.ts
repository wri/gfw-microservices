import { getTotalLocationCount, getMaxLocationId } from './list.utils';
import { Lists } from '@wri-monorepos/sql';

describe('List Utils', () => {
  const mockClientStoreConnection = {
    getConnection: jest.fn(),
  };

  const mockConnection = {
    getRepository: jest.fn(),
  };

  const mockListRepository = {
    findOne: jest.fn(),
  };

  const mockListLocationRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockClientStoreConnection.getConnection.mockResolvedValue(mockConnection);
    mockConnection.getRepository.mockImplementation((entity) => {
      if (entity === Lists) {
        return mockListRepository;
      }
      return mockListLocationRepository;
    });
  });

  describe('getTotalLocationCount', () => {
    it('should return the total location count from the list', async () => {
      const mockList = { listLocationsCount: 100 };
      mockListRepository.findOne.mockResolvedValue(mockList);

      const result = await getTotalLocationCount(
        mockClientStoreConnection,
        'test-db',
        'test-list-id'
      );

      expect(mockClientStoreConnection.getConnection).toHaveBeenCalledWith('test-db');
      expect(mockConnection.getRepository).toHaveBeenCalledWith(Lists);
      expect(mockListRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-list-id' } });
      expect(result).toBe(100);
    });

    it('should handle errors gracefully', async () => {
      mockListRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        getTotalLocationCount(mockClientStoreConnection, 'test-db', 'test-list-id')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getMaxLocationId', () => {
    it('should return the maximum location ID when list table exists', async () => {
      const mockList = { listTableName: 'test_table' };
      mockListRepository.findOne.mockResolvedValue(mockList);
      mockListLocationRepository.getRawOne.mockResolvedValue({ max_id: 50 });

      const result = await getMaxLocationId(mockClientStoreConnection, 'test-db', 'test-list-id');

      expect(mockClientStoreConnection.getConnection).toHaveBeenCalledWith('test-db');
      expect(mockConnection.getRepository).toHaveBeenCalledWith(Lists);
      expect(mockListRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-list-id' } });
      expect(result).toBe(50);
    });

    it('should return 0 when list table name is not found', async () => {
      const mockList = { listTableName: null };
      mockListRepository.findOne.mockResolvedValue(mockList);

      const result = await getMaxLocationId(mockClientStoreConnection, 'test-db', 'test-list-id');

      expect(result).toBe(0);
    });

    it('should return 0 when no locations exist', async () => {
      const mockList = { listTableName: 'test_table' };
      mockListRepository.findOne.mockResolvedValue(mockList);
      mockListLocationRepository.getRawOne.mockResolvedValue(null);

      const result = await getMaxLocationId(mockClientStoreConnection, 'test-db', 'test-list-id');

      expect(result).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      mockListRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        getMaxLocationId(mockClientStoreConnection, 'test-db', 'test-list-id')
      ).rejects.toThrow('Database error');
    });
  });
});
