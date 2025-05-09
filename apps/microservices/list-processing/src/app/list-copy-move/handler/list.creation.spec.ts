import { handleNewListCreation } from './list.creation';
import { CommodityService } from '../../list/commodity.service';
import { ConvertCommodityToMapSpamCode } from '../../list-upload/chain/convert.commodity.mapspam';
import { CreateLargeListService } from '../../list-upload/create.large.list.service';
import { CommodityResponse } from '../../list/types';

interface CreateListResult {
  list_id: number;
}

jest.mock('../../list-upload/create.large.list.service');
jest.mock('../../list-upload/chain/convert.commodity.mapspam');

describe('handleNewListCreation', () => {
  let mockCommodityService: Partial<CommodityService>;
  let mockCreateLargeListService: jest.Mocked<CreateLargeListService>;

  beforeEach(() => {
    mockCommodityService = {
      getCommodityFromExistingList: jest.fn().mockImplementation(async () => ({ commodity: '' })),
      getListCommodityAndTableName: jest.fn(),
      getCommodityFromLocation: jest.fn(),
      getListsByCommodity: jest.fn(),
      getAllTemplates: jest.fn(),
      getCommodityFromTemplate: jest.fn(),
      checkIfListExistAndCommodityIsTheSame: jest.fn(),
    };

    mockCreateLargeListService = {
      run: jest.fn(),
    } as jest.Mocked<CreateLargeListService>;

    (CreateLargeListService as jest.Mock).mockImplementation(() => mockCreateLargeListService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new list with mapped commodity name', async () => {
    // Arrange
    const mockCommodity = 'Palm Oil';
    const mockMappedCommodity = 'palm_oil';
    const mockResponse: CreateListResult = { list_id: 123 };
    const mockCommodityResponse: CommodityResponse = { commodity: mockCommodity };

    (mockCommodityService.getCommodityFromExistingList as jest.Mock).mockResolvedValue(
      mockCommodityResponse
    );
    (ConvertCommodityToMapSpamCode.getCommoditySpamName as jest.Mock).mockReturnValue(
      mockMappedCommodity
    );
    mockCreateLargeListService.run.mockResolvedValue(mockResponse);

    const params = {
      listName: 'Test List',
      userId: 123,
      clientDatabase: 'test_db',
      analysisIds: ['analysis1'],
      gfwListId: 456,
      selectedListId: 789,
      commodity: mockCommodity,
      saveAsDraft: false,
      commodityService: mockCommodityService as CommodityService,
    };

    // Act
    const result = await handleNewListCreation(params);

    // Assert
    expect(mockCommodityService.getCommodityFromExistingList).toHaveBeenCalledWith(
      params.clientDatabase,
      params.selectedListId
    );
    expect(ConvertCommodityToMapSpamCode.getCommoditySpamName).toHaveBeenCalledWith(mockCommodity);
    expect(mockCreateLargeListService.run).toHaveBeenCalledWith({
      ...params,
      commodity: mockMappedCommodity,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should use fallback commodity name when mapping fails', async () => {
    // Arrange
    const mockCommodity = 'Palm Oil';
    const mockResponse: CreateListResult = { list_id: 123 };
    const mockCommodityResponse: CommodityResponse = { commodity: mockCommodity };

    (mockCommodityService.getCommodityFromExistingList as jest.Mock).mockResolvedValue(
      mockCommodityResponse
    );
    (ConvertCommodityToMapSpamCode.getCommoditySpamName as jest.Mock).mockReturnValue(null);
    mockCreateLargeListService.run.mockResolvedValue(mockResponse);

    const params = {
      listName: 'Test List',
      userId: 123,
      clientDatabase: 'test_db',
      analysisIds: ['analysis1'],
      gfwListId: 456,
      selectedListId: 789,
      commodity: mockCommodity,
      saveAsDraft: false,
      commodityService: mockCommodityService as CommodityService,
    };

    // Act
    const result = await handleNewListCreation(params);

    // Assert
    expect(mockCreateLargeListService.run).toHaveBeenCalledWith({
      ...params,
      commodity: 'Palm_Oil',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors from commodity service', async () => {
    // Arrange
    const error = new Error('Commodity service error');
    (mockCommodityService.getCommodityFromExistingList as jest.Mock).mockRejectedValue(error);

    const params = {
      listName: 'Test List',
      userId: 123,
      clientDatabase: 'test_db',
      analysisIds: ['analysis1'],
      gfwListId: 456,
      selectedListId: 789,
      commodity: 'Palm Oil',
      saveAsDraft: false,
      commodityService: mockCommodityService as CommodityService,
    };

    // Act & Assert
    await expect(handleNewListCreation(params)).rejects.toThrow('Commodity service error');
  });
});
