import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LocationService } from './locations.service';
import { GeoService } from '@wri-monorepos/geo';
import { createFeatureProps } from '@wri-monorepos/geo';
import { UspGetLocationsFilteredToCopy } from '@wri-monorepos/sql';
import { ListCopyMoveService } from './list.copy.move.service';
import { ProcessingLimitException } from '../app.exceptions';
import { listStatus } from '@wri-monorepos/constants';

import {
  ListHasFiltersApplies,
  PerformCopyAnalysis,
  PerformLocationsBulkCopy,
  UnlockLists,
  getAnalysisTypesFromIds,
  getListAnalysisStatusByListId,
  SPSListCreation,
} from '@wri-monorepos/geo';

import {
  BulkDeleteLocations,
  DeleteList,
  PerformGetLockStatus,
  SetListDrafStatus,
  UnlockListAndSaveAsDraft,
  UspSetListLocked,
  requestAnalysisProcess,
  updateListsAnalysisStatus,
  getListLocationsCountById,
} from '@wri-monorepos/sql';

import { checkProcessingLimits } from '@wri-monorepos/shared';

// Mock all the imported functions
jest.mock('@wri-monorepos/geo', () => ({
  GeoService: jest.fn(),
  createFeatureProps: jest.fn(),
  ListHasFiltersApplies: jest.fn(),
  PerformCopyAnalysis: jest.fn(),
  PerformLocationsBulkCopy: jest.fn(),
  UnlockLists: jest.fn(),
  getAnalysisTypesFromIds: jest.fn(),
  getListAnalysisStatusByListId: jest.fn(),
  SPSListCreation: jest.fn(),
}));

jest.mock('@wri-monorepos/sql', () => ({
  UspGetLocationsFilteredToCopy: jest.fn(),
  BulkDeleteLocations: jest.fn(),
  DeleteList: jest.fn(),
  PerformGetLockStatus: jest.fn(),
  SetListDrafStatus: jest.fn(),
  UnlockListAndSaveAsDraft: jest.fn(),
  UspSetListLocked: jest.fn(),
  requestAnalysisProcess: jest.fn(),
  updateListsAnalysisStatus: jest.fn(),
  getListLocationsCountById: jest.fn(),
}));

jest.mock('@wri-monorepos/shared', () => ({
  checkProcessingLimits: jest.fn(),
}));

describe('LocationService', () => {
  let service: LocationService;
  let geoService: jest.Mocked<GeoService>;
  let configService: jest.Mocked<ConfigService>;
  let listCopyMoveService: jest.Mocked<ListCopyMoveService>;

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
    configService = module.get(ConfigService);
    listCopyMoveService = module.get(ListCopyMoveService);

    // Reset all mocks
    jest.clearAllMocks();

    // Mock UspGetLocationsFilteredToCopy
    (UspGetLocationsFilteredToCopy as jest.Mock).mockImplementation(() => ({
      run: jest.fn().mockResolvedValue(mockLocationData),
    }));

    // Mock createFeatureProps
    (createFeatureProps as jest.Mock).mockReturnValue(mockFeatureProps);
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

  describe('MoveLocations', () => {
    it('should call listCopyMoveService.run with provided params', async () => {
      const mockParams = { listId: 123, action: 'move' } as any;
      const mockResult = { success: true, action: 'move' as any };

      listCopyMoveService.run.mockResolvedValue(mockResult);

      const result = await service.MoveLocations(mockParams);

      expect(listCopyMoveService.run).toHaveBeenCalledWith(mockParams);
      expect(result).toBe(mockResult);
    });
  });

  describe('handleNewListCreation', () => {
    const mockParams = {
      newListName: 'Test List',
      templateId: 1,
      selectedListLocationClassification: 'test',
      userId: 'user123',
      customAttributesNames: ['attr1'],
      clientDatabase: 'testdb',
      analysisIds: [1, 2],
      isSaveAsDraft: false,
      finalGeojson: { type: 'FeatureCollection', features: [] },
      commodityType: 'cocoa',
      selectedListId: 100,
      srcListAnalysisTable: 'analysis_table',
      selectedLocations: [1, 2, 3],
      organizationId: 'org123',
      subscriptionStatusId: 'sub123',
    };

    beforeEach(() => {
      (PerformGetLockStatus as jest.Mock).mockResolvedValue({ lock_status: 'locked' });
      (SPSListCreation as jest.Mock).mockImplementation(() => ({
        createNewList: jest.fn().mockResolvedValue({ list_id: 200 }),
      }));
      (UspSetListLocked as jest.Mock).mockImplementation(() => ({
        run: jest.fn().mockResolvedValue({}),
      }));
      (PerformLocationsBulkCopy as jest.Mock).mockResolvedValue([10, 11, 12]);
      (PerformCopyAnalysis as jest.Mock).mockResolvedValue({});
      (UnlockLists as jest.Mock).mockResolvedValue({});
      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });
      (getAnalysisTypesFromIds as jest.Mock).mockReturnValue(['deforestation']);
      configService.get.mockReturnValue('https://analysis-url.com');
      (requestAnalysisProcess as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
      });
    });

    it('should handle new list creation successfully', async () => {
      await service.handleNewListCreation(mockParams);

      expect(PerformGetLockStatus).toHaveBeenCalledWith('testdb', 100);
      expect(SPSListCreation).toHaveBeenCalled();
      expect(PerformLocationsBulkCopy).toHaveBeenCalledWith(
        200,
        'Test List',
        true,
        mockParams.finalGeojson,
        'cocoa',
        'testdb'
      );
      expect(PerformCopyAnalysis).toHaveBeenCalled();
      expect(UnlockLists).toHaveBeenCalledWith('testdb', [100, 200]);
    });

    it('should throw error when list is not locked', async () => {
      (PerformGetLockStatus as jest.Mock).mockResolvedValue({ lock_status: null });

      await expect(service.handleNewListCreation(mockParams)).rejects.toThrow('LIST_NOT_LOCKED');
    });

    it('should skip processing limits when saving as draft', async () => {
      const draftParams = { ...mockParams, isSaveAsDraft: true };

      await service.handleNewListCreation(draftParams);

      expect(checkProcessingLimits).not.toHaveBeenCalled();
    });
  });

  describe('handleExistingListUpdate', () => {
    const mockParams = {
      action: 'copy',
      moveToList: { id: 300, list_name: 'Existing List' },
      finalGeojson: { type: 'FeatureCollection', features: [] },
      commodityType: 'palm',
      clientDatabase: 'testdb',
      selectedListId: 100,
      selectedLocations: [1, 2, 3],
      srcListAnalysisTable: 'analysis_table',
      isSaveAsDraft: false,
      gfwListId: 'gfw123',
      organizationId: 'org123',
      subscriptionStatusId: 'sub123',
      userId: 'user123',
    };

    beforeEach(() => {
      (PerformLocationsBulkCopy as jest.Mock).mockResolvedValue([20, 21, 22]);
      (PerformCopyAnalysis as jest.Mock).mockResolvedValue({});
      (UnlockLists as jest.Mock).mockResolvedValue({});
      (UnlockListAndSaveAsDraft as jest.Mock).mockResolvedValue({});
      (getListAnalysisStatusByListId as jest.Mock).mockResolvedValue([
        { analysisId: 1 },
        { analysisId: 2 },
      ]);
      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });
      (getListLocationsCountById as jest.Mock).mockResolvedValue(0);
    });

    it('should handle existing list update successfully', async () => {
      await service.handleExistingListUpdate(mockParams);

      expect(PerformLocationsBulkCopy).toHaveBeenCalledWith(
        300,
        'Existing List',
        false,
        mockParams.finalGeojson,
        'palm',
        'testdb'
      );
      expect(PerformCopyAnalysis).toHaveBeenCalled();
      expect(UnlockLists).toHaveBeenCalledWith('testdb', [100, 300]);
    });

    it('should throw when per-list 150,000 limit would be exceeded', async () => {
      (getListLocationsCountById as jest.Mock).mockResolvedValue(150000);
      await expect(
        service.handleExistingListUpdate({
          ...mockParams,
          finalGeojson: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} },
            ],
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should save as draft when isSaveAsDraft is true', async () => {
      const draftParams = { ...mockParams, isSaveAsDraft: true };

      await service.handleExistingListUpdate(draftParams);

      expect(UnlockListAndSaveAsDraft).toHaveBeenCalledWith('testdb', 300, 'gfw123');
      expect(getListAnalysisStatusByListId).not.toHaveBeenCalled();
    });
  });

  describe('handleSourceListDeletion', () => {
    const mockParams = {
      clientDatabase: 'testdb',
      selectedListId: 100,
      userId: 'user123',
      gfwListId: 'gfw123',
      allLocationsSelected: true,
      filters: { country: null, state: null, subState: null },
      selectedLocations: [1, 2, 3],
    };

    beforeEach(() => {
      (UspSetListLocked as jest.Mock).mockImplementation(() => ({
        run: jest.fn().mockResolvedValue({}),
      }));
      (ListHasFiltersApplies as jest.Mock).mockReturnValue(false);
      (DeleteList as jest.Mock).mockResolvedValue({});
      (BulkDeleteLocations as jest.Mock).mockResolvedValue({});
      (SetListDrafStatus as jest.Mock).mockResolvedValue({});
    });

    it('should delete entire list when all locations selected and no filters', async () => {
      await service.handleSourceListDeletion(mockParams);

      expect(DeleteList).toHaveBeenCalledWith('testdb', 100, 'user123');
      expect(BulkDeleteLocations).not.toHaveBeenCalled();
    });

    it('should delete only selected locations when not all are selected', async () => {
      const partialParams = { ...mockParams, allLocationsSelected: false };

      await service.handleSourceListDeletion(partialParams);

      expect(BulkDeleteLocations).toHaveBeenCalledWith('testdb', 100, 'user123', 'gfw123', '1,2,3');
      expect(SetListDrafStatus).toHaveBeenCalledWith('testdb', 100, 'gfw123');
      expect(DeleteList).not.toHaveBeenCalled();
    });

    it('should delete only selected locations when filters are applied', async () => {
      (ListHasFiltersApplies as jest.Mock).mockReturnValue(true);

      await service.handleSourceListDeletion(mockParams);

      expect(BulkDeleteLocations).toHaveBeenCalled();
      expect(DeleteList).not.toHaveBeenCalled();
    });
  });

  describe('handleProcessingLimits', () => {
    const mockParams = {
      clientDatabase: 'testdb',
      organizationId: 'org123',
      subscriptionStatusId: 'sub123',
      listId: 200,
      userId: 'user123',
      analysisIds: [1, 2],
    };

    beforeEach(() => {
      configService.get.mockReturnValue('https://analysis-url.com');
      (getAnalysisTypesFromIds as jest.Mock).mockReturnValue(['deforestation', 'fires']);
      (requestAnalysisProcess as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ success: true }),
      });
    });

    it('should handle processing limits successfully', async () => {
      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: false,
        processingLimit: 1000,
      });

      await service.handleProcessingLimits(mockParams);

      expect(checkProcessingLimits).toHaveBeenCalledWith({
        organizationDb: 'testdb',
        organizationId: 'org123',
        subscriptionStatusId: 'sub123',
        listId: 200,
      });
      expect(requestAnalysisProcess).toHaveBeenCalledWith('https://analysis-url.com', {
        list_id: 200,
        user_id: 'user123',
        organization_id: 'org123',
        reanalyze: false,
        processing_limit: 1000,
        analysis_types: ['deforestation', 'fires'],
      });
    });

    it('should throw ProcessingLimitException when over limit', async () => {
      (checkProcessingLimits as jest.Mock).mockResolvedValue({
        isListLocationOverLimit: true,
        processingLimit: 1000,
      });

      await expect(service.handleProcessingLimits(mockParams)).rejects.toThrow(
        ProcessingLimitException
      );

      expect(updateListsAnalysisStatus).toHaveBeenCalledWith('testdb', {
        listId: 200,
        errorInfo: 'Exceeded Analysis Limit',
        status: listStatus.Inactive,
      });
      expect(requestAnalysisProcess).not.toHaveBeenCalled();
    });
  });
});
