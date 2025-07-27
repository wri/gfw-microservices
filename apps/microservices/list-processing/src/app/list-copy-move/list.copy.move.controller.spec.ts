import { Test, TestingModule } from '@nestjs/testing';
import { ActionType, TargetListType } from '@wri-monorepos/sql';
import { ListCopyMoveController } from './list.copy.move.controller';
import { LocationService } from './locations.service';
import { CopyOrMoveLargeListRequestLLP } from '../../models';
import { copyOrMoveLargeListRequestSchema } from '../validators';

interface CopyMoveResult {
  success: boolean;
  action: ActionType;
}

describe('ListCopyMoveController', () => {
  let controller: ListCopyMoveController;
  let locationService: jest.Mocked<LocationService>;

  const mockLocationService = {
    MoveLocations: jest.fn<Promise<CopyMoveResult | null>, [unknown]>(),
  };

  const validRequest: CopyOrMoveLargeListRequestLLP = {
    listId: 123,
    selectedListLocationClassification: 'test-classification',
    customAttributesNames: ['attr1', 'attr2'],
    userListNames: ['list1', 'list2'],
    action: ActionType.Copy,
    listType: TargetListType.New,
    listName: 'Test List',
    targetList: undefined,
    selectedLocations: [1, 2, 3],
    addType: 'add',
    activeTemplate: 'template1',
    commodityType: 'test-commodity',
    templateData: { template: 'data' },
    saveAsDraft: false,
    userId: 789,
    clientDatabase: 'test-db',
    organizationId: 101,
    subscriptionStatusId: 1,
    gfwListId: 202,
    allLocationsSelected: false,
    filters: { country: 'US', state: 'CA' },
    srcListAnalysisTable: 'test-table',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListCopyMoveController],
      providers: [
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    controller = module.get<ListCopyMoveController>(ListCopyMoveController);
    locationService = module.get(LocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should inject LocationService', () => {
      expect(locationService).toBeDefined();
    });
  });

  describe('CopyOrMoveLargeList', () => {
    it('should successfully call locationService.MoveLocations with request data', async () => {
      // Arrange
      const expectedResult: CopyMoveResult = {
        success: true,
        action: ActionType.Copy,
      };
      locationService.MoveLocations.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CopyOrMoveLargeList(validRequest);

      // Assert
      expect(locationService.MoveLocations).toHaveBeenCalledTimes(1);
      expect(locationService.MoveLocations).toHaveBeenCalledWith({
        ...validRequest,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle copy action type', async () => {
      // Arrange
      const copyRequest = { ...validRequest, action: ActionType.Copy };
      const expectedResult: CopyMoveResult = { success: true, action: ActionType.Copy };
      locationService.MoveLocations.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CopyOrMoveLargeList(copyRequest);

      // Assert
      expect(locationService.MoveLocations).toHaveBeenCalledWith(copyRequest);
      expect(result).toEqual(expectedResult);
    });

    it('should handle move action type', async () => {
      // Arrange
      const moveRequest = { ...validRequest, action: ActionType.Move };
      const expectedResult: CopyMoveResult = { success: true, action: ActionType.Move };
      locationService.MoveLocations.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CopyOrMoveLargeList(moveRequest);

      // Assert
      expect(locationService.MoveLocations).toHaveBeenCalledWith(moveRequest);
      expect(result).toEqual(expectedResult);
    });

    it('should handle new target list type', async () => {
      // Arrange
      const newListRequest = { ...validRequest, listType: TargetListType.New };
      const expectedResult: CopyMoveResult = { success: true, action: ActionType.Copy };
      locationService.MoveLocations.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CopyOrMoveLargeList(newListRequest);

      // Assert
      expect(locationService.MoveLocations).toHaveBeenCalledWith(newListRequest);
      expect(result).toEqual(expectedResult);
    });

    it('should handle existing target list type', async () => {
      // Arrange
      const existingListRequest = { ...validRequest, listType: TargetListType.Existing };
      const expectedResult: CopyMoveResult = { success: true, action: ActionType.Copy };
      locationService.MoveLocations.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CopyOrMoveLargeList(existingListRequest);

      // Assert
      expect(locationService.MoveLocations).toHaveBeenCalledWith(existingListRequest);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from locationService', async () => {
      // Arrange
      const error = new Error('Service error');
      locationService.MoveLocations.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.CopyOrMoveLargeList(validRequest)).rejects.toThrow('Service error');
      expect(locationService.MoveLocations).toHaveBeenCalledWith(validRequest);
    });

    it('should handle service returning null/undefined', async () => {
      // Arrange
      locationService.MoveLocations.mockResolvedValue(null);

      // Act
      const result = await controller.CopyOrMoveLargeList(validRequest);

      // Assert
      expect(result).toBeNull();
      expect(locationService.MoveLocations).toHaveBeenCalledWith(validRequest);
    });

    it('should handle empty arrays in request', async () => {
      // Arrange
      const requestWithEmptyArrays = {
        ...validRequest,
        customAttributesNames: [],
        userListNames: [],
        selectedLocations: [],
      };
      const expectedResult: CopyMoveResult = { success: true, action: ActionType.Copy };
      locationService.MoveLocations.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CopyOrMoveLargeList(requestWithEmptyArrays);

      // Assert
      expect(locationService.MoveLocations).toHaveBeenCalledWith(requestWithEmptyArrays);
      expect(result).toEqual(expectedResult);
    });

    it('should handle request with optional commodityType', async () => {
      // Arrange
      const requestWithoutCommodityType = { ...validRequest };
      delete requestWithoutCommodityType.commodityType;
      const expectedResult: CopyMoveResult = { success: true, action: ActionType.Copy };
      locationService.MoveLocations.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CopyOrMoveLargeList(requestWithoutCommodityType);

      // Assert
      expect(locationService.MoveLocations).toHaveBeenCalledWith(requestWithoutCommodityType);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validation', () => {
    it('should validate correct request structure', async () => {
      // This test ensures the validation pipe accepts valid requests
      expect(() => {
        copyOrMoveLargeListRequestSchema.parse(validRequest);
      }).not.toThrow();
    });

    it('should reject invalid action type', () => {
      const invalidRequest = { ...validRequest, action: 'invalid-action' };

      expect(() => {
        copyOrMoveLargeListRequestSchema.parse(invalidRequest);
      }).toThrow();
    });

    it('should reject missing required fields', () => {
      const incompleteRequest = { listId: 123 }; // Missing required fields

      expect(() => {
        copyOrMoveLargeListRequestSchema.parse(incompleteRequest);
      }).toThrow();
    });

    it('should coerce number fields correctly', () => {
      const requestWithStringNumbers = {
        ...validRequest,
        listId: '123',
        userId: '789',
        organizationId: '101',
      };

      const parsed = copyOrMoveLargeListRequestSchema.parse(requestWithStringNumbers);
      expect(typeof parsed.listId).toBe('number');
      expect(typeof parsed.userId).toBe('number');
      expect(typeof parsed.organizationId).toBe('number');
    });

    it('should coerce boolean fields correctly', () => {
      const requestWithStringBooleans = {
        ...validRequest,
        saveAsDraft: 'true',
        allLocationsSelected: '', // Empty string coerces to false
      };

      const parsed = copyOrMoveLargeListRequestSchema.parse(requestWithStringBooleans);
      expect(typeof parsed.saveAsDraft).toBe('boolean');
      expect(typeof parsed.allLocationsSelected).toBe('boolean');
      expect(parsed.saveAsDraft).toBe(true);
      expect(parsed.allLocationsSelected).toBe(false);
    });
  });
});
