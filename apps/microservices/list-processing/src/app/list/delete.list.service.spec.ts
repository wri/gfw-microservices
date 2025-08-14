import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { DeleteListService } from './delete.list.service';
import { ActivityLog, ClientStoreConnection, DeleteListTypeOrm } from '@wri-monorepos/sql';

describe('DeleteListService', () => {
  let service: DeleteListService;
  let clientStoreConnection: jest.Mocked<ClientStoreConnection>;
  let deleteListTypeOrm: jest.Mocked<DeleteListTypeOrm>;
  let mockConnection: { getRepository: jest.Mock };
  let mockActivityLogRepository: { save: jest.Mock };

  const mockListId = 123;
  const mockOrgDatabase = 'test-org-db';
  const mockOrgUserId = 456;

  beforeEach(async () => {
    // Mock ActivityLog repository
    mockActivityLogRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    // Mock database connection
    mockConnection = {
      getRepository: jest.fn().mockReturnValue(mockActivityLogRepository),
    };

    // Mock ClientStoreConnection
    clientStoreConnection = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
      clearCache: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ClientStoreConnection>;

    // Mock DeleteListTypeOrm
    deleteListTypeOrm = {
      delete: jest.fn(),
      logger: { error: jest.fn(), log: jest.fn(), warn: jest.fn(), debug: jest.fn() },
      clientStoreConnection: clientStoreConnection,
      lockList: jest.fn(),
    } as unknown as jest.Mocked<DeleteListTypeOrm>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteListService,
        {
          provide: ClientStoreConnection,
          useValue: clientStoreConnection,
        },
        {
          provide: DeleteListTypeOrm,
          useValue: deleteListTypeOrm,
        },
      ],
    }).compile();

    service = module.get<DeleteListService>(DeleteListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should successfully delete a list and log activity', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(true);
      const expectedMessage = `User '${mockOrgUserId}' has deleted list (${mockListId}).`;

      // Act
      const result = await service.run(mockListId, mockOrgDatabase, mockOrgUserId);

      // Assert
      expect(clientStoreConnection.getConnection).toHaveBeenCalledWith(mockOrgDatabase);
      expect(mockConnection.getRepository).toHaveBeenCalledWith(ActivityLog);
      expect(deleteListTypeOrm.delete).toHaveBeenCalledWith(
        mockOrgDatabase,
        mockListId,
        mockOrgUserId
      );

      expect(mockActivityLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockOrgUserId,
          activityTypeId: 21,
          activityDescription: expectedMessage,
          activityTime: expect.any(Date),
        })
      );

      expect(result).toBe(expectedMessage);
    });

    it('should throw InternalServerErrorException when delete fails', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(false);
      const expectedErrorDescription = `User '${mockOrgUserId}' has tried to delete list (${mockListId}) but some error occurs Failed to delete list ${mockListId}.`;

      // Act & Assert
      await expect(service.run(mockListId, mockOrgDatabase, mockOrgUserId)).rejects.toThrow(
        new InternalServerErrorException({
          message: expectedErrorDescription,
          code: 603,
        })
      );

      expect(deleteListTypeOrm.delete).toHaveBeenCalledWith(
        mockOrgDatabase,
        mockListId,
        mockOrgUserId
      );

      // Verify error activity log was saved
      expect(mockActivityLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockOrgUserId,
          activityTypeId: 21,
          activityDescription: expectedErrorDescription,
          activityTime: expect.any(Date),
        })
      );
    });

    it('should handle deletion errors and log failure activity', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      deleteListTypeOrm.delete.mockRejectedValue(mockError);
      const expectedErrorDescription = `User '${mockOrgUserId}' has tried to delete list (${mockListId}) but some error occurs ${mockError.message}.`;

      // Act & Assert
      await expect(service.run(mockListId, mockOrgDatabase, mockOrgUserId)).rejects.toThrow(
        new InternalServerErrorException({
          message: expectedErrorDescription,
          code: 603,
        })
      );

      expect(mockActivityLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockOrgUserId,
          activityTypeId: 21,
          activityDescription: expectedErrorDescription,
          activityTime: expect.any(Date),
        })
      );
    });

    it('should handle repository connection errors', async () => {
      // Arrange
      const connectionError = new Error('Failed to get connection');
      clientStoreConnection.getConnection.mockRejectedValue(connectionError);

      // Act & Assert
      await expect(service.run(mockListId, mockOrgDatabase, mockOrgUserId)).rejects.toThrow(
        connectionError
      );
    });

    it('should handle activity log save errors during success path', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(true);
      const saveError = new Error('Failed to save activity log');

      // Mock save to fail on first call (success log) but succeed on second call (error log)
      mockActivityLogRepository.save
        .mockRejectedValueOnce(saveError)
        .mockResolvedValueOnce(undefined);

      const expectedErrorDescription = `User '${mockOrgUserId}' has tried to delete list (${mockListId}) but some error occurs ${saveError.message}.`;

      // Act & Assert
      await expect(service.run(mockListId, mockOrgDatabase, mockOrgUserId)).rejects.toThrow(
        new InternalServerErrorException({
          message: expectedErrorDescription,
          code: 603,
        })
      );

      // Verify that the activity log save was attempted twice
      // First the success log (which fails), then the error log in catch block (which succeeds)
      expect(mockActivityLogRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should create proper ActivityLog object for successful deletion', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(true);
      let savedActivityLog: ActivityLog;
      mockActivityLogRepository.save.mockImplementation((activityLog) => {
        savedActivityLog = activityLog;
        return Promise.resolve();
      });

      // Act
      await service.run(mockListId, mockOrgDatabase, mockOrgUserId);

      // Assert
      expect(savedActivityLog).toBeInstanceOf(ActivityLog);
      expect(savedActivityLog.userId).toBe(mockOrgUserId);
      expect(savedActivityLog.activityTypeId).toBe(21);
      expect(savedActivityLog.activityDescription).toContain(mockOrgUserId.toString());
      expect(savedActivityLog.activityDescription).toContain(mockListId.toString());
      expect(savedActivityLog.activityTime).toBeInstanceOf(Date);
    });

    it('should create proper ActivityLog object for failed deletion', async () => {
      // Arrange
      const mockError = new Error('Test error');
      deleteListTypeOrm.delete.mockRejectedValue(mockError);
      let savedActivityLog: ActivityLog;
      mockActivityLogRepository.save.mockImplementation((activityLog) => {
        savedActivityLog = activityLog;
        return Promise.resolve();
      });

      // Act
      try {
        await service.run(mockListId, mockOrgDatabase, mockOrgUserId);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(savedActivityLog).toBeInstanceOf(ActivityLog);
      expect(savedActivityLog.userId).toBe(mockOrgUserId);
      expect(savedActivityLog.activityTypeId).toBe(21);
      expect(savedActivityLog.activityDescription).toContain(mockOrgUserId.toString());
      expect(savedActivityLog.activityDescription).toContain(mockListId.toString());
      expect(savedActivityLog.activityDescription).toContain('error occurs');
      expect(savedActivityLog.activityTime).toBeInstanceOf(Date);
    });
  });
});
