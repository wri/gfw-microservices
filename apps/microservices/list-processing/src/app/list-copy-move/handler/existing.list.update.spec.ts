import { handleExistingListUpdate } from './existing.list.update';
import { UspSetListLocked, getListLocationsCountById } from '@wri-monorepos/sql';
import {
  FeatureCollection,
  handleCreateAnalysis,
  PerformCopyAnalysis,
  PerformLocationsBulkCopy,
  UnlockLists,
} from '@wri-monorepos/geo';
import { UnlockListAndSaveAsDraft } from '@wri-monorepos/sql';
import { ListSizeLimitException } from '../../common/listSizeLimit.exception';

const mockRun = jest.fn();
jest.mock('@wri-monorepos/sql', () => {
  const actual = jest.requireActual('@wri-monorepos/sql');
  return {
    ...actual,
    UspSetListLocked: jest.fn().mockImplementation(() => ({
      run: mockRun,
    })),
    UnlockListAndSaveAsDraft: jest.fn(),
    getListLocationsCountById: jest.fn(),
  };
});

jest.mock('@wri-monorepos/geo', () => ({
  handleCreateAnalysis: jest.fn(),
  PerformCopyAnalysis: jest.fn(),
  PerformLocationsBulkCopy: jest.fn(),
  UnlockLists: jest.fn(),
}));

describe('handleExistingListUpdate', () => {
  const mockClientDatabase = 'test-db';
  const mockUserId = 123;
  const mockSelectedListId = 1;
  const mockMoveToList = { id: 2, list_name: 'Test List' };
  const mockAction = 'copy';
  const mockFinalGeojson = {
    type: 'FeatureCollection',
    features: [],
  } as unknown as FeatureCollection;
  const mockCommodityType = 'wood';
  const mockSrcListAnalysisTable = 'analysis_table';
  const mockSelectedLocations = [1, 2];
  const mockGfwListId = 123;
  const mockOrganizationId = 456;
  const mockAnalysisIds = ['Alerts', 'FCD'];
  const mockSubscriptionStatusId = 789;

  beforeEach(() => {
    jest.clearAllMocks();
    (getListLocationsCountById as jest.Mock).mockResolvedValue(1000);
  });

  it('should handle list update with save as draft', async () => {
    const mockDestLocationIds = [1, 2];
    (PerformLocationsBulkCopy as jest.Mock).mockResolvedValue(mockDestLocationIds);

    await handleExistingListUpdate({
      clientDatabase: mockClientDatabase,
      selectedListId: mockSelectedListId,
      moveToList: mockMoveToList,
      userId: mockUserId,
      action: mockAction,
      isSaveAsDraft: true,
      finalGeojson: mockFinalGeojson,
      commodityType: mockCommodityType,
      srcListAnalysisTable: mockSrcListAnalysisTable,
      selectedLocations: mockSelectedLocations,
      gfwListId: mockGfwListId,
      organizationId: mockOrganizationId,
      analysisIds: mockAnalysisIds,
      subscriptionStatusId: mockSubscriptionStatusId,
    });

    expect(UspSetListLocked).toHaveBeenCalledTimes(2);
    expect(mockRun).toHaveBeenCalledWith(mockClientDatabase, mockSelectedListId, mockUserId);
    expect(mockRun).toHaveBeenCalledWith(mockClientDatabase, mockMoveToList.id, mockUserId);

    expect(PerformLocationsBulkCopy).toHaveBeenCalledWith(
      mockMoveToList.id,
      mockMoveToList.list_name,
      false,
      mockFinalGeojson,
      mockCommodityType,
      mockClientDatabase
    );

    expect(PerformCopyAnalysis).toHaveBeenCalledWith(
      mockClientDatabase,
      mockSrcListAnalysisTable,
      mockSelectedListId,
      mockMoveToList.id,
      mockSelectedLocations,
      mockDestLocationIds,
      true // isGFWList should be true when gfwListId is defined
    );

    expect(UnlockListAndSaveAsDraft).toHaveBeenCalledWith(
      mockClientDatabase,
      mockMoveToList.id,
      mockGfwListId
    );

    expect(UnlockLists).toHaveBeenCalledWith(mockClientDatabase, [
      mockSelectedListId,
      mockMoveToList.id,
    ]);
  });

  it('should throw ListSizeLimitException when incoming + existing exceed 150,000', async () => {
    (getListLocationsCountById as jest.Mock).mockResolvedValue(150000);
    const tooMany: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] } as any,
          properties: {},
        },
      ],
    } as any;

    await expect(
      handleExistingListUpdate({
        clientDatabase: mockClientDatabase,
        selectedListId: mockSelectedListId,
        moveToList: mockMoveToList,
        userId: mockUserId,
        action: mockAction,
        isSaveAsDraft: true,
        finalGeojson: tooMany,
        commodityType: mockCommodityType,
        srcListAnalysisTable: mockSrcListAnalysisTable,
        selectedLocations: mockSelectedLocations,
        gfwListId: mockGfwListId,
        organizationId: mockOrganizationId,
        analysisIds: mockAnalysisIds,
        subscriptionStatusId: mockSubscriptionStatusId,
      })
    ).rejects.toBeInstanceOf(ListSizeLimitException);
  });

  it('should handle list update with analysis creation', async () => {
    const mockDestLocationIds = [1, 2];
    (PerformLocationsBulkCopy as jest.Mock).mockResolvedValue(mockDestLocationIds);
    (handleCreateAnalysis as jest.Mock).mockResolvedValue('OK');

    await handleExistingListUpdate({
      clientDatabase: mockClientDatabase,
      selectedListId: mockSelectedListId,
      moveToList: mockMoveToList,
      userId: mockUserId,
      action: mockAction,
      isSaveAsDraft: false,
      finalGeojson: mockFinalGeojson,
      commodityType: mockCommodityType,
      srcListAnalysisTable: mockSrcListAnalysisTable,
      selectedLocations: mockSelectedLocations,
      gfwListId: mockGfwListId,
      organizationId: mockOrganizationId,
      analysisIds: mockAnalysisIds,
      subscriptionStatusId: mockSubscriptionStatusId,
    });

    expect(PerformCopyAnalysis).toHaveBeenCalledWith(
      mockClientDatabase,
      mockSrcListAnalysisTable,
      mockSelectedListId,
      mockMoveToList.id,
      mockSelectedLocations,
      expect.any(Array),
      true // isGFWList should be true when gfwListId is defined
    );

    expect(handleCreateAnalysis).toHaveBeenCalledWith(
      'Alerts,FCD',
      mockMoveToList.id,
      mockOrganizationId,
      mockClientDatabase,
      true,
      mockUserId,
      mockSubscriptionStatusId,
      false
    );
  });

  it('should pass isGFWList as true when gfwListId is defined', async () => {
    const mockDestLocationIds = [1, 2];
    (PerformLocationsBulkCopy as jest.Mock).mockResolvedValue(mockDestLocationIds);

    await handleExistingListUpdate({
      clientDatabase: mockClientDatabase,
      selectedListId: mockSelectedListId,
      moveToList: mockMoveToList,
      userId: mockUserId,
      action: mockAction,
      isSaveAsDraft: true,
      finalGeojson: mockFinalGeojson,
      commodityType: mockCommodityType,
      srcListAnalysisTable: mockSrcListAnalysisTable,
      selectedLocations: mockSelectedLocations,
      gfwListId: 456, // defined gfwListId
      organizationId: mockOrganizationId,
      analysisIds: mockAnalysisIds,
      subscriptionStatusId: mockSubscriptionStatusId,
    });

    expect(PerformCopyAnalysis).toHaveBeenCalledWith(
      mockClientDatabase,
      mockSrcListAnalysisTable,
      mockSelectedListId,
      mockMoveToList.id,
      mockSelectedLocations,
      mockDestLocationIds,
      true // isGFWList should be true when gfwListId is defined
    );
  });

  it('should pass isGFWList as false when gfwListId is undefined', async () => {
    const mockDestLocationIds = [1, 2];
    (PerformLocationsBulkCopy as jest.Mock).mockResolvedValue(mockDestLocationIds);

    await handleExistingListUpdate({
      clientDatabase: mockClientDatabase,
      selectedListId: mockSelectedListId,
      moveToList: mockMoveToList,
      userId: mockUserId,
      action: mockAction,
      isSaveAsDraft: true,
      finalGeojson: mockFinalGeojson,
      commodityType: mockCommodityType,
      srcListAnalysisTable: mockSrcListAnalysisTable,
      selectedLocations: mockSelectedLocations,
      gfwListId: undefined, // undefined gfwListId
      organizationId: mockOrganizationId,
      analysisIds: mockAnalysisIds,
      subscriptionStatusId: mockSubscriptionStatusId,
    });

    expect(PerformCopyAnalysis).toHaveBeenCalledWith(
      mockClientDatabase,
      mockSrcListAnalysisTable,
      mockSelectedListId,
      mockMoveToList.id,
      mockSelectedLocations,
      mockDestLocationIds,
      false // isGFWList should be false when gfwListId is undefined
    );
  });

  it('should throw error when analysis creation fails', async () => {
    const mockDestLocationIds = [1, 2];
    (PerformLocationsBulkCopy as jest.Mock).mockResolvedValue(mockDestLocationIds);
    (handleCreateAnalysis as jest.Mock).mockResolvedValue('Error');

    await expect(
      handleExistingListUpdate({
        clientDatabase: mockClientDatabase,
        selectedListId: mockSelectedListId,
        moveToList: mockMoveToList,
        userId: mockUserId,
        action: mockAction,
        isSaveAsDraft: false,
        finalGeojson: mockFinalGeojson,
        commodityType: mockCommodityType,
        srcListAnalysisTable: mockSrcListAnalysisTable,
        selectedLocations: mockSelectedLocations,
        gfwListId: mockGfwListId,
        organizationId: mockOrganizationId,
        analysisIds: mockAnalysisIds,
        subscriptionStatusId: mockSubscriptionStatusId,
      })
    ).rejects.toThrow('Failed to start analysis: Error');
  });

  it('should handle errors during the process and still unlock lists', async () => {
    const mockError = new Error('Test error');
    (PerformLocationsBulkCopy as jest.Mock).mockRejectedValue(mockError);

    await expect(
      handleExistingListUpdate({
        clientDatabase: mockClientDatabase,
        selectedListId: mockSelectedListId,
        moveToList: mockMoveToList,
        userId: mockUserId,
        action: mockAction,
        isSaveAsDraft: false,
        finalGeojson: mockFinalGeojson,
        commodityType: mockCommodityType,
        srcListAnalysisTable: mockSrcListAnalysisTable,
        selectedLocations: mockSelectedLocations,
        gfwListId: mockGfwListId,
        organizationId: mockOrganizationId,
        analysisIds: mockAnalysisIds,
        subscriptionStatusId: mockSubscriptionStatusId,
      })
    ).rejects.toThrow('Test error');

    expect(UnlockLists).toHaveBeenCalledWith(mockClientDatabase, [
      mockSelectedListId,
      mockMoveToList.id,
    ]);
  });

  it('should validate input parameters', async () => {
    await expect(
      handleExistingListUpdate({
        clientDatabase: mockClientDatabase,
        selectedListId: 0,
        moveToList: { id: 0, list_name: 'Test List' },
        userId: mockUserId,
        action: mockAction,
        isSaveAsDraft: false,
        finalGeojson: mockFinalGeojson,
        commodityType: mockCommodityType,
        srcListAnalysisTable: mockSrcListAnalysisTable,
        selectedLocations: mockSelectedLocations,
        gfwListId: mockGfwListId,
        organizationId: mockOrganizationId,
        analysisIds: mockAnalysisIds,
        subscriptionStatusId: mockSubscriptionStatusId,
      })
    ).rejects.toThrow('Invalid list IDs provided');

    await expect(
      handleExistingListUpdate({
        clientDatabase: mockClientDatabase,
        selectedListId: mockSelectedListId,
        moveToList: mockMoveToList,
        userId: 0,
        action: mockAction,
        isSaveAsDraft: false,
        finalGeojson: mockFinalGeojson,
        commodityType: mockCommodityType,
        srcListAnalysisTable: mockSrcListAnalysisTable,
        selectedLocations: mockSelectedLocations,
        gfwListId: mockGfwListId,
        organizationId: mockOrganizationId,
        analysisIds: mockAnalysisIds,
        subscriptionStatusId: mockSubscriptionStatusId,
      })
    ).rejects.toThrow('User ID is required');

    await expect(
      handleExistingListUpdate({
        clientDatabase: mockClientDatabase,
        selectedListId: mockSelectedListId,
        moveToList: mockMoveToList,
        userId: mockUserId,
        action: mockAction,
        isSaveAsDraft: false,
        finalGeojson: null,
        commodityType: mockCommodityType,
        srcListAnalysisTable: mockSrcListAnalysisTable,
        selectedLocations: mockSelectedLocations,
        gfwListId: mockGfwListId,
        organizationId: mockOrganizationId,
        analysisIds: mockAnalysisIds,
        subscriptionStatusId: mockSubscriptionStatusId,
      })
    ).rejects.toThrow('Geojson data is required');
  });
});
