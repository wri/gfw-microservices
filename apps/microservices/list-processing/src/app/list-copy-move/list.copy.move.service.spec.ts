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

  beforeEach(async () => {
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
    const mockRequest = {
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
      gfwListId: 1,
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
    };

    it('should successfully copy to a new list', async () => {
      const result = await service.run(mockRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should successfully copy to an existing list', async () => {
      const copyToExistingRequest = {
        ...mockRequest,
        listType: TargetListType.Existing,
      };

      const result = await service.run(copyToExistingRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should successfully move to a new list', async () => {
      const moveToNewRequest = {
        ...mockRequest,
        action: ActionType.Move,
        listType: TargetListType.New,
      };

      const result = await service.run(moveToNewRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should successfully move to an existing list', async () => {
      const moveRequest = {
        ...mockRequest,
        action: ActionType.Move,
        listType: TargetListType.Existing,
      };

      const result = await service.run(moveRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should handle invalid list names', async () => {
      const invalidNameRequest = {
        ...mockRequest,
        listName: 'Invalid Name',
      };

      const CheckListNameIsValid = jest.requireMock('@wri-monorepos/geo').CheckListNameIsValid;
      CheckListNameIsValid.mockImplementationOnce(() => {
        throw new Error('Invalid list name');
      });

      const result = await service.run(invalidNameRequest);
      expect(result).toBeUndefined();
    });

    it('should handle copying with all locations selected', async () => {
      const allLocationsRequest = {
        ...mockRequest,
        allLocationsSelected: true,
        selectedLocations: [],
      };

      const result = await service.run(allLocationsRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should handle moving with all locations selected', async () => {
      const allLocationsRequest = {
        ...mockRequest,
        action: ActionType.Move,
        allLocationsSelected: true,
        selectedLocations: [],
      };

      const result = await service.run(allLocationsRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should handle copying with different commodity type', async () => {
      const differentCommodityRequest = {
        ...mockRequest,
        commodityType: 'different-commodity',
      };

      const result = await service.run(differentCommodityRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should handle copying as draft', async () => {
      const draftRequest = {
        ...mockRequest,
        saveAsDraft: true,
      };

      const result = await service.run(draftRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Copy,
      });
    });

    it('should handle moving as draft', async () => {
      const draftRequest = {
        ...mockRequest,
        action: ActionType.Move,
        saveAsDraft: true,
      };

      const result = await service.run(draftRequest);
      expect(result).toEqual({
        success: true,
        action: ActionType.Move,
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      const handleNewListCreation =
        jest.requireMock('./handler/list.creation').handleNewListCreation;
      handleNewListCreation.mockRejectedValueOnce(error);

      const result = await service.run(mockRequest);
      expect(result).toBeUndefined();
    });
  });
});
