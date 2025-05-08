import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LocationService } from './locations.service';
import { GeoService } from '@wri-monorepos/geo';
import { ListCopyMoveService } from '../app/list-copy-move/list.copy.move.service';
import { ProcessingLimitException } from '../app/app.exceptions';

// Mock the external dependencies
jest.mock('@wri-monorepos/shared', () => ({
  checkProcessingLimits: jest.fn(),
  getFinalGeojson: jest.fn(),
}));

jest.mock('@wri-monorepos/sql', () => ({
  requestAnalysisProcess: jest.fn(),
  updateListsAnalysisStatus: jest.fn(),
  ActionType: {
    Move: 'move',
    Copy: 'copy',
  },
  TargetListType: {
    New: 'new',
    Existing: 'existing',
  },
}));

describe('LocationService', () => {
  let service: LocationService;

  const mockGeoService = {
    createGeoJSON: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockListCopyMoveService = {
    run: jest.fn(),
  };

  // Mock database client
  const mockClientDatabase = {
    query: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: GeoService,
          useValue: mockGeoService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ListCopyMoveService,
          useValue: mockListCopyMoveService,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('assembleGeojson', () => {
    it('should successfully assemble GeoJSON from feature properties and uploading data', async () => {
      const featProps = [{ location_id: 1 }, { location_id: 2 }];
      const uploadingData = [
        { location_id: 1, geometry: { type: 'Point', coordinates: [0, 0] } },
        { location_id: 2, geometry: { type: 'Point', coordinates: [1, 1] } },
      ];

      mockGeoService.createGeoJSON.mockReturnValue({
        features: [
          { properties: { location_id: 1 }, geometry: { type: 'Point', coordinates: [0, 0] } },
          { properties: { location_id: 2 }, geometry: { type: 'Point', coordinates: [1, 1] } },
        ],
      });

      const result = await service.assembleGeojson(featProps, uploadingData);

      expect(result).toEqual({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { location_id: 1 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: { location_id: 2 },
            geometry: { type: 'Point', coordinates: [1, 1] },
          },
        ],
      });
    });

    it('should reject if GeoJSON creation fails', async () => {
      const featProps = [{ location_id: 1 }];
      const uploadingData = [{ location_id: 1 }];

      mockGeoService.createGeoJSON.mockReturnValue(null);

      await expect(service.assembleGeojson(featProps, uploadingData)).rejects.toBe(
        'GEO JSON creation not success'
      );
    });
  });

  describe('MoveLocations', () => {
    it('should use listCopyMoveService when isUploadListLpEnabled is true', async () => {
      const sql = await import('@wri-monorepos/sql');

      const params = {
        isUploadListLpEnabled: true,
        listId: 1,
        selectedListLocationClassification: 'test',
        customAttributesNames: [],
        userListNames: [],
        action: sql.ActionType.Copy,
        listType: sql.TargetListType.New,
        listName: 'test',
        selectedLocations: [1, 2],
        addType: 'test',
        commodityType: 'test',
        templateData: 'test-template',
        saveAsDraft: false,
        userId: 1,
        clientDatabase: mockClientDatabase,
        organizationId: 1,
        subscriptionStatusId: 1,
        gfwListId: 1,
        filters: {},
        srcListAnalysisTable: 'test',
        activeTemplate: null,
        allLocationsSelected: false,
      };

      mockListCopyMoveService.run.mockResolvedValue({ success: true, action: sql.ActionType.Copy });

      const result = await service.MoveLocations(params);

      expect(mockListCopyMoveService.run).toHaveBeenCalledWith(params);
      expect(result).toEqual({ success: true, action: sql.ActionType.Copy });
    });
  });

  describe('handleProcessingLimits', () => {
    it('should throw ProcessingLimitException when list location is over limit', async () => {
      const params = {
        clientDatabase: mockClientDatabase,
        organizationId: 1,
        subscriptionStatusId: 1,
        listId: 1,
        userId: 1,
        analysisIds: [1, 2],
      };

      const { checkProcessingLimits } = await import('@wri-monorepos/shared');
      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: true,
        processingLimit: 100,
      });

      await expect(service.handleProcessingLimits(params)).rejects.toThrow(
        ProcessingLimitException
      );
    });

    it('should process analysis when within limits', async () => {
      const params = {
        clientDatabase: mockClientDatabase,
        organizationId: 1,
        subscriptionStatusId: 1,
        listId: 1,
        userId: 1,
        analysisIds: [1, 2],
      };

      const { checkProcessingLimits } = await import('@wri-monorepos/shared');
      const { requestAnalysisProcess } = await import('@wri-monorepos/sql');

      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 100,
      });

      (requestAnalysisProcess as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });

      mockConfigService.get.mockReturnValue('http://analysis-url');

      await service.handleProcessingLimits(params);

      expect(mockConfigService.get).toHaveBeenCalledWith('AWS_ANALYSIS_LAMBDA_URL', {
        infer: true,
      });
      expect(requestAnalysisProcess).toHaveBeenCalled();
    });
  });
});
