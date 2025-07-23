import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LocationService } from './locations.service';
import { GeoService } from '@wri-monorepos/geo';
import { createFeatureProps } from '@wri-monorepos/geo';
import {
  CopyOrMoveLargeListRequest,
  ActionType,
  TargetListType,
  UspGetLocationsFilteredToCopy,
} from '@wri-monorepos/sql';
import { ListCopyMoveService } from './list.copy.move.service';

jest.mock('@wri-monorepos/geo');
jest.mock('@wri-monorepos/sql');
jest.mock('@wri-monorepos/shared');

describe('LocationService', () => {
  let service: LocationService;
  let geoService: jest.Mocked<GeoService>;
  let listCopyMoveService: jest.Mocked<ListCopyMoveService>;

  const mockClientDatabase = 'mock-db';
  const mockUserId = 123;
  const mockListId = 123;
  const mockGfwListId = 123;
  const mockOrganizationId = 123;
  const mockSubscriptionStatusId = 123;

  const mockLocationData = [
    { location_id: 1, geometry: { type: 'Point', coordinates: [0, 0] } },
    { location_id: 2, geometry: { type: 'Point', coordinates: [1, 1] } },
  ];

  const mockFeatureProps = [
    { id: 1, name: 'Location 1' },
    { id: 2, name: 'Location 2' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: GeoService,
          useValue: {
            createGeoJSON: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ListCopyMoveService,
          useValue: {
            run: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    geoService = module.get(GeoService);
    listCopyMoveService = module.get(ListCopyMoveService);

    // Mock UspGetLocationsFilteredToCopy
    (UspGetLocationsFilteredToCopy as jest.Mock).mockImplementation(() => ({
      run: jest.fn().mockResolvedValue(mockLocationData),
    }));

    // Mock createFeatureProps
    (createFeatureProps as jest.Mock).mockReturnValue(mockFeatureProps);
  });

  describe('MoveLocations', () => {
    const mockParams: CopyOrMoveLargeListRequest = {
      listId: mockListId,
      selectedListLocationClassification: 'test',
      customAttributesNames: [],
      userListNames: [],
      action: ActionType.Move,
      listType: TargetListType.Existing,
      listName: 'Test List',
      targetList: {
        id: 123,
        user_id: mockUserId,
        template_id: 1,
        list_name: 'Target List',
        list_table_name: 'test_table',
        list_analysis_table_name: 'test_analysis_table',
        list_status_id: 1,
        list_error_message: null,
        location_classification: 'test',
        custom_attribute_names: null,
        custom_attribute_types: null,
        list_locations_count: 0,
        lock_status: null,
        lock_user_id: null,
        associated_gfwlist: null,
        dashboard_last_submit: null,
        dashboard_last_results: null,
        vector_tiles_storage_path: null,
        error_file_storage_path: null,
        vector_tiles_last_updated: null,
        version: 1,
        Commodity: null,
        large_list_id: null,
      },
      selectedLocations: [1, 2],
      addType: 'test',
      activeTemplate: 'test',
      commodityType: 'test',
      templateData: {},
      saveAsDraft: false,
      userId: mockUserId,
      clientDatabase: mockClientDatabase,
      organizationId: mockOrganizationId,
      subscriptionStatusId: mockSubscriptionStatusId,
      gfwListId: mockGfwListId,
      allLocationsSelected: false,
      filters: {
        country: null,
        state: null,
        subState: null,
        analysisAreaMin: null,
        analysisAreaMax: null,
        searchString: null,
      },
      srcListAnalysisTable: 'test',
      isUploadListLpEnabled: false,
    };

    it('should use listCopyMoveService when isUploadListLpEnabled is true', async () => {
      const params = { ...mockParams, isUploadListLpEnabled: true };
      listCopyMoveService.run.mockResolvedValue({ success: true, action: ActionType.Move });

      const result = await service.MoveLocations(params);

      expect(listCopyMoveService.run).toHaveBeenCalledWith(params);
      expect(result).toEqual({ success: true, action: ActionType.Move });
    });
    /*
test cases for service.MoveLocations(params) already tested at apps/microservices/list-processing/src/app/list-copy-move/list.copy.move.service.spec.ts
*/
  });

  describe('assembleGeojson', () => {
    it('should assemble geojson successfully', async () => {
      const featProps = [{ id: 1 }, { id: 2 }];
      const uploadingData = [
        { location_id: 1, geometry: { type: 'Point', coordinates: [0, 0] } },
        { location_id: 2, geometry: { type: 'Point', coordinates: [1, 1] } },
      ];

      geoService.createGeoJSON.mockReturnValue({
        type: 'FeatureCollection',
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
            properties: { id: 1 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: { id: 2 },
            geometry: { type: 'Point', coordinates: [1, 1] },
          },
        ],
      });
    });

    it('should reject when geojson creation fails', async () => {
      const featProps = [{ id: 1 }];
      const uploadingData = [{ location_id: 1 }];

      geoService.createGeoJSON.mockReturnValue(null);

      await expect(service.assembleGeojson(featProps, uploadingData)).rejects.toBe(
        'GEO JSON creation not success'
      );
    });
  });
});
