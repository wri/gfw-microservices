import { ClientStoreConnection, ListsUploadStatus } from '@wri-monorepos/sql';
import axios from 'axios';
import { updateListsUploadStatus, getMetadata } from './update.lists.upload.status';
import { Repository } from 'typeorm';

jest.mock('@wri-monorepos/sql');
jest.mock('axios');

interface MockRepository extends Partial<Repository<ListsUploadStatus>> {
  findOne: jest.Mock;
  save: jest.Mock;
}

interface MockConnection {
  getRepository: jest.Mock;
}

describe('Update Lists Upload Status', () => {
  let mockRepository: MockRepository;
  let mockConnection: MockConnection;

  const mockTaskARN = 'arn:aws:ecs:us-east-1:123456789012:task/prod-cluster/abc123';
  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockConnection = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => ({
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    }));

    // Reset environment variables
    process.env.MICROSERVICES_ENV = undefined;

    // Mock axios for all tests
    (axios.get as jest.Mock).mockResolvedValue({
      data: { TaskARN: mockTaskARN },
    });
  });

  describe('updateListsUploadStatus', () => {
    it('should create new record if none exists', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await updateListsUploadStatus('test-store', 123, 'test-stage');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 123,
          lastSuccessfulStage: 'test-stage',
          errorInfo: undefined,
          workerInstanceId: mockTaskARN,
        })
      );
    });

    it('should update existing record', async () => {
      const existingRecord = new ListsUploadStatus();
      existingRecord.listId = 123;
      existingRecord.lastSuccessfulStage = 'old-stage';
      mockRepository.findOne.mockResolvedValue(existingRecord);

      await updateListsUploadStatus('test-store', 123, 'new-stage', 'error occurred');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 123,
          lastSuccessfulStage: 'new-stage',
          errorInfo: 'error occurred',
          workerInstanceId: mockTaskARN,
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(updateListsUploadStatus('test-store', 123, 'test-stage')).resolves.not.toThrow();
    });
  });

  describe('getMetadata', () => {
    beforeEach(() => {
      // Reset axios mock for getMetadata tests
      (axios.get as jest.Mock).mockReset();
    });

    it('should return mock taskARN for test environment', async () => {
      process.env.MICROSERVICES_ENV = 'test';

      const result = await getMetadata();

      expect(result).toEqual({
        taskARN: 'arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-test',
      });
    });

    it('should return mock taskARN for dev environment', async () => {
      process.env.MICROSERVICES_ENV = 'dev';

      const result = await getMetadata();

      expect(result).toEqual({
        taskARN: 'arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-dev',
      });
    });

    it('should fetch metadata from ECS container metadata endpoint', async () => {
      process.env.MICROSERVICES_ENV = 'prod';

      const result = await getMetadata();

      expect(result).toEqual({ taskARN: mockTaskARN });
    });
  });
});
