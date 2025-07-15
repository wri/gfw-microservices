import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { DeleteListService } from './delete.list.service';
import { ActivityLog, ClientStoreConnection, DeleteListTypeOrm } from '@wri-monorepos/sql';

interface MockRepository {
  save: jest.MockedFunction<(entity: ActivityLog) => Promise<ActivityLog>>;
}

interface MockConnection {
  getRepository: jest.MockedFunction<(entity: typeof ActivityLog) => MockRepository>;
}

interface MockClientStoreConnection {
  getConnection: jest.MockedFunction<(database: string) => Promise<MockConnection>>;
}

interface MockDeleteListTypeOrm {
  delete: jest.MockedFunction<
    (
      organizationDatabase: string,
      list_id: number,
      organization_user_id: number
    ) => Promise<boolean>
  >;
}

describe('DeleteListService', () => {
  let service: DeleteListService;
  let clientStoreConnection: MockClientStoreConnection;
  let deleteListTypeOrm: MockDeleteListTypeOrm;
  let mockConnection: MockConnection;
  let mockRepository: MockRepository;

  beforeEach(async () => {
    // Mock repository
    mockRepository = {
      save: jest.fn().mockImplementation((entity: ActivityLog) => Promise.resolve(entity)),
    };

    // Mock connection
    mockConnection = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    // Mock ClientStoreConnection
    clientStoreConnection = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    };

    // Mock DeleteListTypeOrm
    deleteListTypeOrm = {
      delete: jest.fn(),
    };

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
    const testParams = {
      list_id: 123,
      organizationDatabase: 'test_db',
      organization_user_id: 456,
      userEmail: 'test@example.com',
    };

    it('should successfully delete a list and log activity', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(true);
      const mockActivityLog = new ActivityLog();
      mockRepository.save.mockResolvedValue(mockActivityLog);

      // Act
      const result = await service.run(
        testParams.list_id,
        testParams.organizationDatabase,
        testParams.organization_user_id,
        testParams.userEmail
      );

      // Assert
      expect(clientStoreConnection.getConnection).toHaveBeenCalledWith('test_db');
      expect(mockConnection.getRepository).toHaveBeenCalledWith(ActivityLog);
      expect(deleteListTypeOrm.delete).toHaveBeenCalledWith('test_db', 123, 456);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 456,
          activityTypeId: 21,
          activityDescription: "User 'test@example.com' has deleted list (123).",
          activityTime: expect.any(Date),
        })
      );

      expect(result).toBe("User 'test@example.com' has deleted list (123).");
    });

    it('should throw InternalServerErrorException when delete fails', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(false);
      const mockActivityLog = new ActivityLog();
      mockRepository.save.mockResolvedValue(mockActivityLog);

      // Mock logger to avoid console output during tests
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      // Act & Assert
      await expect(
        service.run(
          testParams.list_id,
          testParams.organizationDatabase,
          testParams.organization_user_id,
          testParams.userEmail
        )
      ).rejects.toThrow(
        new InternalServerErrorException({
          message: `User 'test@example.com' has tried to delete list (123) but some error occurs Failed to delete list 123.`,
          code: 603,
        })
      );

      expect(deleteListTypeOrm.delete).toHaveBeenCalledWith('test_db', 123, 456);
      expect(loggerSpy).toHaveBeenCalledWith('DeleteList failure', expect.any(Error));

      // Verify error activity was logged
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 456,
          activityTypeId: 21,
          activityDescription: `User 'test@example.com' has tried to delete list (123) but some error occurs Failed to delete list 123.`,
          activityTime: expect.any(Date),
        })
      );

      loggerSpy.mockRestore();
    });

    it('should throw InternalServerErrorException when delete fails with null result', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(null);
      const mockActivityLog = new ActivityLog();
      mockRepository.save.mockResolvedValue(mockActivityLog);

      // Mock logger to avoid console output during tests
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      // Act & Assert
      await expect(
        service.run(
          testParams.list_id,
          testParams.organizationDatabase,
          testParams.organization_user_id,
          testParams.userEmail
        )
      ).rejects.toThrow(
        new InternalServerErrorException({
          message: `User 'test@example.com' has tried to delete list (123) but some error occurs Failed to delete list 123.`,
          code: 603,
        })
      );

      // Verify error activity was logged
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 456,
          activityTypeId: 21,
          activityDescription: `User 'test@example.com' has tried to delete list (123) but some error occurs Failed to delete list 123.`,
          activityTime: expect.any(Date),
        })
      );

      loggerSpy.mockRestore();
    });

    it('should handle exceptions during deletion and log error activity', async () => {
      // Arrange
      const errorMessage = 'Database connection error';
      deleteListTypeOrm.delete.mockRejectedValue(new Error(errorMessage));
      const mockActivityLog = new ActivityLog();
      mockRepository.save.mockResolvedValue(mockActivityLog);

      // Mock logger to avoid console output during tests
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      // Act & Assert
      await expect(
        service.run(
          testParams.list_id,
          testParams.organizationDatabase,
          testParams.organization_user_id,
          testParams.userEmail
        )
      ).rejects.toThrow(
        new InternalServerErrorException({
          message: `User 'test@example.com' has tried to delete list (123) but some error occurs ${errorMessage}.`,
          code: 603,
        })
      );

      // Verify error was logged
      expect(loggerSpy).toHaveBeenCalledWith('DeleteList failure', expect.any(Error));

      // Verify error activity was logged
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 456,
          activityTypeId: 21,
          activityDescription: `User 'test@example.com' has tried to delete list (123) but some error occurs ${errorMessage}.`,
          activityTime: expect.any(Date),
        })
      );

      loggerSpy.mockRestore();
    });

    it('should handle exceptions during activity log saving in success case', async () => {
      // Arrange
      deleteListTypeOrm.delete.mockResolvedValue(true);
      const mockActivityLog = new ActivityLog();
      mockRepository.save
        .mockRejectedValueOnce(new Error('Activity log save failed')) // First call (in success case) fails
        .mockResolvedValueOnce(mockActivityLog); // Second call (in error case) succeeds

      // Mock logger to avoid console output during tests
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      // Act & Assert
      await expect(
        service.run(
          testParams.list_id,
          testParams.organizationDatabase,
          testParams.organization_user_id,
          testParams.userEmail
        )
      ).rejects.toThrow(
        new InternalServerErrorException({
          message: `User 'test@example.com' has tried to delete list (123) but some error occurs Activity log save failed.`,
          code: 603,
        })
      );

      expect(loggerSpy).toHaveBeenCalledWith('DeleteList failure', expect.any(Error));
      loggerSpy.mockRestore();
    });

    it('should handle exceptions during connection establishment', async () => {
      // Arrange
      clientStoreConnection.getConnection.mockRejectedValue(new Error('Connection failed'));

      // Act & Assert
      await expect(
        service.run(
          testParams.list_id,
          testParams.organizationDatabase,
          testParams.organization_user_id,
          testParams.userEmail
        )
      ).rejects.toThrow(new Error('Connection failed'));

      expect(clientStoreConnection.getConnection).toHaveBeenCalledWith('test_db');
    });
  });
});
