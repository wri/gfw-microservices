import { Test, TestingModule } from '@nestjs/testing';
import { ListCopyMoveService } from './list.copy.move.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@wri-monorepos/aws';
import { CommodityService } from '../list/commodity.service';
import { ActionType, TargetListType } from '@wri-monorepos/sql';

// Mock all dependencies
jest.mock('../list-upload/chain/types', () => {
  class MockAbstractHandler {
    static runFullChain = jest.fn().mockResolvedValue(undefined);
  }
  return {
    AbstractHandler: MockAbstractHandler,
  };
});

jest.mock('../list-upload/chain/convert.commodity.mapspam', () => ({
  ConvertCommodityToMapSpamCode: jest.fn().mockImplementation(() => ({
    handle: jest.fn().mockResolvedValue({}),
  })),
}));

jest.mock('@wri-monorepos/sql', () => ({
  upgradeListSchema: jest.fn().mockResolvedValue(undefined),
  ActionType: {
    Copy: 'COPY',
    Move: 'MOVE',
  },
  TargetListType: {
    New: 'NEW',
    Existing: 'EXISTING',
  },
  UspGetLocationsFilteredToCopy: jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Location 1',
        geometry: 'POINT(0 0)',
      },
      {
        id: 2,
        name: 'Location 2',
        geometry: 'POINT(1 1)',
      },
    ]),
  })),
}));

jest.mock('@wri-monorepos/geo', () => ({
  CheckListNameIsValid: jest.fn(),
  getListAnalysisStatusByListId: jest
    .fn()
    .mockResolvedValue([{ analysisId: 'analysis1' }, { analysisId: 'analysis2' }]),
}));

jest.mock('../list-upload/chain/process.upload.data', () => ({
  ProcessUploadData: jest.fn().mockImplementation(() => ({
    setNext: jest.fn(),
  })),
}));

jest.mock('../list-upload/chain/convert.geojson.properties', () => ({
  ConvertGeojsonProperties: jest.fn().mockImplementation(() => ({
    setNext: jest.fn(),
  })),
}));

jest.mock('../list-upload/chain/put.list.as.draft', () => ({
  PutListAsDraft: jest.fn().mockImplementation(() => ({
    putListAsDraft: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('./handler/list.creation', () => ({
  handleNewListCreation: jest.fn().mockResolvedValue({ list_id: 789 }),
}));

jest.mock('./handler/existing.list.update', () => ({
  handleExistingListUpdate: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./handler/source.list.deletion', () => ({
  handleSourceListDeletion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./shared/assemble.geojson', () => ({
  assembleGeojson: jest.fn().mockResolvedValue({
    type: 'FeatureCollection',
    features: [],
  }),
}));

jest.mock('./shared/create.feature.props', () => ({
  createFeatureProps: jest.fn().mockReturnValue([]),
}));

jest.mock('./shared/delete.geojson.feature.properties', () => ({
  deleteGeoJSONFeatureProperties: jest.fn(),
}));

describe('ListCopyMoveService', () => {
  let service: ListCopyMoveService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockCommodityService = {
    getCommodity: jest.fn(),
  };

  const createMockRequest = (overrides = {}) => ({
    listId: 123,
    userListNames: ['List 1', 'List 2'],
    action: ActionType.Copy,
    listType: TargetListType.New,
    listName: 'New List',
    targetList: {
      id: 456,
      list_name: 'Target List',
      user_id: 1,
      template_id: 1,
      list_table_name: 'list_table',
      list_analysis_table_name: 'analysis_table',
      list_type: 'type1',
      list_status: 'active',
      list_status_id: 1,
      list_error_message: null,
      location_classification: 'classification1',
      custom_attribute_names: 'attr1,attr2',
      custom_attribute_types: 'type1,type2',
      list_locations_count: 10,
      lock_status: new Date(),
      lock_user_id: null,
      associated_gfwlist: 1,
      dashboard_last_submit: new Date(),
      dashboard_last_results: new Date(),
      vector_tiles_storage_path: 'path/to/tiles',
      error_file_storage_path: 'path/to/error',
      vector_tiles_last_updated: new Date(),
      version: 1,
      Commodity: 'commodity1',
      large_list_id: 789,
      list_created_at: new Date(),
      list_updated_at: new Date(),
      list_deleted_at: null,
      list_created_by: 'user1',
      list_updated_by: 'user1',
      list_deleted_by: null,
      list_description: 'description',
      list_notes: 'notes',
      list_tags: 'tags',
      list_metadata: {},
      list_version: '1.0',
      list_parent_id: null,
      list_root_id: null,
      list_path: 'path',
      list_depth: 0,
      list_order: 0,
      list_is_public: false,
      list_is_template: false,
      list_is_system: false,
      list_is_archived: false,
      list_is_deleted: false,
      list_is_draft: false,
      list_is_published: true,
      list_is_shared: false,
      list_is_starred: false,
      list_is_trashed: false,
      list_is_verified: true,
      list_is_visible: true,
      list_is_writable: true,
      list_is_locked: false,
      list_is_processing: false,
      list_is_ready: true,
      list_is_error: false,
      list_is_warning: false,
      list_is_info: false,
      list_is_success: true,
      list_is_failure: false,
      list_is_complete: true,
      list_is_incomplete: false,
      list_is_exported: false,
      list_is_imported: false,
      list_is_modified: false,
      list_is_original: true,
      list_is_copied: false,
      list_is_moved: false,
      list_is_renamed: false,
      list_is_restored: false,
    },
    selectedLocations: [1, 2],
    commodityType: 'commodity1',
    saveAsDraft: false,
    userId: 1,
    clientDatabase: 'client-db',
    organizationId: 1,
    subscriptionStatusId: 1,
    gfwListId: undefined,
    allLocationsSelected: false,
    filters: {
      country: 'US',
      state: 'CA',
      subState: 'LA',
      analysisAreaMin: 0,
      analysisAreaMax: 100,
      searchString: '',
    },
    srcListAnalysisTable: 'analysis_table',
    selectedListLocationClassification: '',
    customAttributesNames: [],
    addType: 'ADD',
    activeTemplate: 'template1',
    templateId: 'template1',
    templateVersion: '1.0',
    templateData: {},
    isUploadListLpEnabled: false,
    ...overrides,
  });

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCopyMoveService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: CommodityService,
          useValue: mockCommodityService,
        },
      ],
    }).compile();

    service = module.get<ListCopyMoveService>(ListCopyMoveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('should call runGfwList when gfwListId is present', async () => {
      const mockRequest = createMockRequest({ gfwListId: 1 });
      const runGfwListSpy = jest.spyOn(service, 'runGfwList').mockResolvedValue({
        success: true,
        action: ActionType.Copy,
      });

      const result = await service.run(mockRequest);

      expect(runGfwListSpy).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should call runUserList when gfwListId is not present', async () => {
      const mockRequest = createMockRequest();
      const runUserListSpy = jest.spyOn(service, 'runUserList').mockResolvedValue({
        success: true,
        action: ActionType.Copy,
      });

      const result = await service.run(mockRequest);

      expect(runUserListSpy).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });
  });

  describe('runGfwList', () => {
    it('should successfully process GFW list copy to new list', async () => {
      const mockRequest = createMockRequest({
        gfwListId: 1,
        listType: TargetListType.New,
      });

      const result = await service.runGfwList(mockRequest);

      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should successfully process GFW list copy to existing list', async () => {
      const mockRequest = createMockRequest({
        gfwListId: 1,
        listType: TargetListType.Existing,
      });

      const result = await service.runGfwList(mockRequest);

      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should use FCD analysis for GFW lists', async () => {
      const mockRequest = createMockRequest({
        gfwListId: 1,
        listType: TargetListType.New,
      });

      const handleNewListCreation =
        jest.requireMock('./handler/list.creation').handleNewListCreation;

      await service.runGfwList(mockRequest);

      expect(handleNewListCreation).toHaveBeenCalledWith(
        expect.objectContaining({
          analysisIds: ['FCD'],
        })
      );
    });

    it('should pass isGFWList flag to location data query', async () => {
      const mockRequest = createMockRequest({ gfwListId: 1 });
      const UspGetLocationsFilteredToCopy =
        jest.requireMock('@wri-monorepos/sql').UspGetLocationsFilteredToCopy;
      const mockInstance = { run: jest.fn().mockResolvedValue([]) };
      UspGetLocationsFilteredToCopy.mockImplementation(() => mockInstance);

      await service.runGfwList(mockRequest);

      expect(mockInstance.run).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isGFWList: true,
        })
      );
    });
  });

  describe('runUserList', () => {
    it('should successfully copy to a new list', async () => {
      const mockRequest = createMockRequest();
      const result = await service.runUserList(mockRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should successfully copy to an existing list', async () => {
      const copyToExistingRequest = createMockRequest({
        listType: TargetListType.Existing,
      });

      const result = await service.runUserList(copyToExistingRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should successfully move to a new list', async () => {
      const moveToNewRequest = createMockRequest({
        action: ActionType.Move,
        listType: TargetListType.New,
      });

      const result = await service.runUserList(moveToNewRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should successfully move to an existing list', async () => {
      const moveRequest = createMockRequest({
        action: ActionType.Move,
        listType: TargetListType.Existing,
      });

      const result = await service.runUserList(moveRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should handle invalid list names', async () => {
      const invalidNameRequest = createMockRequest({
        listName: 'Invalid Name',
      });

      const CheckListNameIsValid = jest.requireMock('@wri-monorepos/geo').CheckListNameIsValid;
      CheckListNameIsValid.mockImplementationOnce(() => {
        throw new Error('Invalid list name');
      });

      const result = await service.runUserList(invalidNameRequest);
      expect(result).toBeUndefined();
    });

    it('should handle copying with all locations selected', async () => {
      const allLocationsRequest = createMockRequest({
        allLocationsSelected: true,
        selectedLocations: [],
      });

      const result = await service.runUserList(allLocationsRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should handle moving with all locations selected', async () => {
      const allLocationsRequest = createMockRequest({
        action: ActionType.Move,
        allLocationsSelected: true,
        selectedLocations: [],
      });

      const result = await service.runUserList(allLocationsRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should handle copying with different commodity type', async () => {
      const differentCommodityRequest = createMockRequest({
        commodityType: 'different-commodity',
      });

      const result = await service.runUserList(differentCommodityRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should handle copying as draft', async () => {
      const draftRequest = createMockRequest({
        saveAsDraft: true,
      });

      const result = await service.runUserList(draftRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should handle moving as draft', async () => {
      const draftRequest = createMockRequest({
        action: ActionType.Move,
        saveAsDraft: true,
      });

      const result = await service.runUserList(draftRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should upgrade schema for both source and target lists when copying to existing', async () => {
      const mockRequest = createMockRequest({
        listType: TargetListType.Existing,
      });

      const upgradeListSchema = jest.requireMock('@wri-monorepos/sql').upgradeListSchema;

      await service.runUserList(mockRequest);

      expect(upgradeListSchema).toHaveBeenCalledTimes(2);
      expect(upgradeListSchema).toHaveBeenCalledWith({
        clientDb: mockRequest.clientDatabase,
        listId: mockRequest.listId,
        userId: mockRequest.userId,
      });
      expect(upgradeListSchema).toHaveBeenCalledWith({
        clientDb: mockRequest.clientDatabase,
        listId: mockRequest.targetList.id,
        userId: mockRequest.userId,
      });
    });

    it('should put source list as draft when moving', async () => {
      const mockRequest = createMockRequest({
        action: ActionType.Move,
      });

      const PutListAsDraft = jest.requireMock(
        '../list-upload/chain/put.list.as.draft'
      ).PutListAsDraft;
      const mockPutListAsDraft = { putListAsDraft: jest.fn() };
      PutListAsDraft.mockImplementation(() => mockPutListAsDraft);

      await service.runUserList(mockRequest);

      expect(mockPutListAsDraft.putListAsDraft).toHaveBeenCalledWith(
        mockRequest.clientDatabase,
        mockRequest.listId,
        mockRequest.gfwListId
      );
    });

    it('should handle source list deletion when moving', async () => {
      const mockRequest = createMockRequest({
        action: ActionType.Move,
      });

      const handleSourceListDeletion = jest.requireMock(
        './handler/source.list.deletion'
      ).handleSourceListDeletion;

      await service.runUserList(mockRequest);

      expect(handleSourceListDeletion).toHaveBeenCalledWith({
        clientDatabase: mockRequest.clientDatabase,
        selectedListId: mockRequest.listId,
        userId: mockRequest.userId,
        gfwListId: mockRequest.gfwListId,
        allLocationsSelected: mockRequest.allLocationsSelected,
        filters: mockRequest.filters,
        selectedLocations: mockRequest.selectedLocations,
        putListAsDraft: expect.any(Object),
      });
    });

    it('should get analysis IDs from existing list', async () => {
      const mockRequest = createMockRequest();

      const getListAnalysisStatusByListId =
        jest.requireMock('@wri-monorepos/geo').getListAnalysisStatusByListId;

      await service.runUserList(mockRequest);

      expect(getListAnalysisStatusByListId).toHaveBeenCalledWith(
        mockRequest.clientDatabase,
        mockRequest.listId
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      const handleNewListCreation =
        jest.requireMock('./handler/list.creation').handleNewListCreation;
      handleNewListCreation.mockRejectedValueOnce(error);

      const mockRequest = createMockRequest();
      const result = await service.runUserList(mockRequest);
      expect(result).toBeUndefined();
    });
  });

  describe('Common functionality', () => {
    it('should call AbstractHandler.runFullChain for both user and GFW lists', async () => {
      const AbstractHandler = jest.requireMock('../list-upload/chain/types').AbstractHandler;

      // Test user list
      const userRequest = createMockRequest();
      await service.runUserList(userRequest);

      // Test GFW list
      const gfwRequest = createMockRequest({ gfwListId: 1 });
      await service.runGfwList(gfwRequest);

      expect(AbstractHandler.runFullChain).toHaveBeenCalledTimes(2);
    });

    it('should call handleExistingListUpdate for both user and GFW lists', async () => {
      const handleExistingListUpdate = jest.requireMock(
        './handler/existing.list.update'
      ).handleExistingListUpdate;

      // Test user list
      const userRequest = createMockRequest();
      await service.runUserList(userRequest);

      // Test GFW list
      const gfwRequest = createMockRequest({ gfwListId: 1 });
      await service.runGfwList(gfwRequest);

      expect(handleExistingListUpdate).toHaveBeenCalledTimes(2);
    });

    it('should call assembleGeojson for both user and GFW lists', async () => {
      const assembleGeojson = jest.requireMock('./shared/assemble.geojson').assembleGeojson;

      // Test user list
      const userRequest = createMockRequest();
      await service.runUserList(userRequest);

      // Test GFW list
      const gfwRequest = createMockRequest({ gfwListId: 1 });
      await service.runGfwList(gfwRequest);

      expect(assembleGeojson).toHaveBeenCalledTimes(2);
    });
  });
});
