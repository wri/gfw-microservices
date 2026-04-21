import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { GADMService } from './gadm.service';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { ChainType, RequestNewList } from './types';
import { featureFlagsService } from '@wri-monorepos/shared';

jest.mock('axios');
jest.mock('@esri/arcgis-rest-feature-service');
jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('GADMService', () => {
  let service: GADMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GADMService],
    }).compile();

    service = module.get<GADMService>(GADMService);

    (featureFlagsService as jest.Mock).mockResolvedValue({
      getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue([
        {
          flagId: 'gadm41',
          flagState: false,
        },
      ]),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGadmData', () => {
    it('should throw error for features with unanalyzable error', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { hasUnanalyzableError: true },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      await expect(service.getGadmData(feature)).rejects.toThrow(
        'Feature does not have valid longitude/latitude or geometry.'
      );
    });

    it('retries retryable errors through the breaker and surfaces the last error', async () => {
      const realSetTimeout = global.setTimeout;
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
        cb();
        return 0 as any;
      });

      try {
        const feature: Feature = {
          type: 'Feature',
          properties: { longitude: 0, latitude: 0 },
          geometry: { type: 'Point', coordinates: [0, 0] },
        };
        const err = Object.assign(new Error('gateway timeout'), {
          response: { status: 504 },
        });
        (axios.post as jest.Mock).mockRejectedValue(err);

        await expect(service.getGadmData(feature)).rejects.toThrow('gateway timeout');
        expect(axios.post).toHaveBeenCalledTimes(3);
      } finally {
        setTimeoutSpy.mockRestore();
        global.setTimeout = realSetTimeout;
      }
    });

    it('should return data on successful fetch', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      const mockData = [
        { gid_1: '123', gid_2: '456', name_0: 'Country', name_1: 'State', name_2: 'Substate' },
      ];
      (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: { data: mockData } });
      const result = await service.getGadmData(feature);
      expect(result).toEqual(mockData);
    });
  });

  describe('addGeoReferenceData', () => {
    it('should add geo reference data successfully', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      const mockData = [
        { gid_1: '123', gid_2: '456', name_0: 'Country', name_1: 'State', name_2: 'Substate' },
      ];
      jest.spyOn(service, 'getGadmData').mockResolvedValue(mockData);
      await service.addGeoReferenceData(feature);
      expect(feature.properties).toEqual({
        longitude: 0,
        latitude: 0,
        subState: 'Substate',
        state: 'State',
        country: 'Country',
        gadmid: '456',
      });
    });

    it('should handle error and set hasUnanalyzableError on feature', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'getGadmData').mockRejectedValue(new Error('Test error'));
      await service.addGeoReferenceData(feature);
      expect(feature.properties.hasUnanalyzableError).toBe(true);
    });

    it('should handle empty response array', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'getGadmData').mockResolvedValue([]);
      await service.addGeoReferenceData(feature);
      expect(feature.properties).toEqual({
        longitude: 0,
        latitude: 0,
      });
    });

    it('should handle gid_2 missing and use gid_1', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      const mockData = [
        { gid_1: '123_ABC', name_0: 'Country', name_1: 'State', name_2: 'Substate' },
      ];
      jest.spyOn(service, 'getGadmData').mockResolvedValue(mockData);
      await service.addGeoReferenceData(feature);
      expect(feature.properties.gadmid).toBe('123');
    });
  });

  describe('addGeoReferenceDataToFeatures', () => {
    it('should process features in batches', async () => {
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { longitude: 0, latitude: 0 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      };
      const request: ChainType = {
        geojson,
        request: {
          list_id: 1,
          organization_database: 'test',
          path: 'test',
          organization_id: 123,
        } as RequestNewList,
      };

      jest.spyOn(service, 'addGeoReferenceData').mockResolvedValue({} as any);
      const result = await service.addGeoReferenceDataToFeatures(geojson, request);
      expect(service.addGeoReferenceData).toHaveBeenCalled();
      expect(result.type).toBe('FeatureCollection');
    });
  });

  describe('handle', () => {
    it('should handle the input with features', async () => {
      const input: ChainType = {
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { longitude: 0, latitude: 0 },
              geometry: { type: 'Point', coordinates: [0, 0] },
            },
          ],
        },
        request: {
          list_id: 1,
          organization_database: 'test',
          path: 'test',
          organization_id: 123,
          hasUnanalyzableError: false,
        } as RequestNewList,
      };

      jest.spyOn(service, 'addGeoReferenceDataToFeatures').mockResolvedValue(input.geojson!);
      const result = await service.handle(input);
      expect(service.addGeoReferenceDataToFeatures).toHaveBeenCalled();
      expect(result).toEqual(input);
    });

    it('should skip GADM processing if hasUnanalyzableError is true', async () => {
      const input: ChainType = {
        geojson: { type: 'FeatureCollection', features: [] },
        request: {
          list_id: 1,
          organization_database: 'test',
          path: 'test',
          organization_id: 123,
          hasUnanalyzableError: true,
        } as RequestNewList,
      };

      jest.spyOn(service, 'addGeoReferenceDataToFeatures');
      const result = await service.handle(input);
      expect(service.addGeoReferenceDataToFeatures).not.toHaveBeenCalled();
      expect(result).toEqual(input);
    });

    it('should set hasUnanalyzableError on request if any feature has error', async () => {
      const input: ChainType = {
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { longitude: 0, latitude: 0 },
              geometry: { type: 'Point', coordinates: [0, 0] },
            },
          ],
        },
        request: {
          list_id: 1,
          organization_database: 'test',
          path: 'test',
          organization_id: 123,
          hasUnanalyzableError: false,
        } as RequestNewList,
      };

      const processedGeoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { longitude: 0, latitude: 0, hasUnanalyzableError: true },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      };

      jest.spyOn(service, 'addGeoReferenceDataToFeatures').mockResolvedValue(processedGeoJson);
      const result = await service.handle(input);
      expect(service.addGeoReferenceDataToFeatures).toHaveBeenCalled();
      expect((result.request as RequestNewList).hasUnanalyzableError).toBe(true);
    });

    it('should not set hasUnanalyzableError on request if no feature has error', async () => {
      const input: ChainType = {
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { longitude: 0, latitude: 0 },
              geometry: { type: 'Point', coordinates: [0, 0] },
            },
          ],
        },
        request: {
          list_id: 1,
          organization_database: 'test',
          path: 'test',
          organization_id: 123,
          hasUnanalyzableError: false,
        } as RequestNewList,
      };

      const processedGeoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { longitude: 0, latitude: 0, country: 'Country', state: 'State' },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      };

      jest.spyOn(service, 'addGeoReferenceDataToFeatures').mockResolvedValue(processedGeoJson);
      const result = await service.handle(input);
      expect(service.addGeoReferenceDataToFeatures).toHaveBeenCalled();
      expect((result.request as RequestNewList).hasUnanalyzableError).toBe(false);
    });
  });
});
