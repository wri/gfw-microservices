import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { GADMService } from './gadm.service';
import { Feature } from '@wri-monorepos/geo';
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

  describe('getGadmServiceUrl', () => {
    it('should return the correct URL based on environment', () => {
      process.env.NODE_ENV = 'production';
      expect(service.getGadmServiceUrl()).toBe(
        'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'
      );
      process.env.NODE_ENV = 'development';
      expect(service.getGadmServiceUrl()).toBe(
        'https://gfwpro-gis-stg.globalforestwatch.org/arcgis/rest/services/GADM36_admin_2_gridded/MapServer/0'
      );
    });
  });

  describe('queryGADM', () => {
    it('should throw error for features with unanalyzable error', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { hasUnanalyzableError: true },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      await expect(service.queryGADM(feature)).rejects.toThrow(
        'Feature does not have valid longitude/latitude or geometry.'
      );
    });

    it('should query GADM service successfully', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      const mockResponse = {
        features: [
          { attributes: { name_0: 'Country', name_1: 'State', name_2: 'Substate', gadmid: '123' } },
        ],
      };
      jest.spyOn(service, 'queryGADM').mockResolvedValue(mockResponse);
      const result = await service.queryGADM(feature);
      expect(result).toEqual(mockResponse);
    });
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

    it('should return null on fetch error', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));
      const result = await service.getGadmData(feature);
      expect(result).toBeNull();
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

    it('should handle error and return hasUnanalyzableError', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'getGadmData').mockRejectedValue(new Error('Test error'));
      const result = await service.addGeoReferenceData(feature);
      expect(result).toEqual({ hasUnanalyzableError: true });
    });
  });

  describe('getGeoReferenceData', () => {
    it('should get geo reference data', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'queryGADM').mockResolvedValue({
        features: [
          { attributes: { name_0: 'Country', name_1: 'State', name_2: 'Substate', gadmid: '123' } },
        ],
      });
      await service.getGeoReferenceData(feature);
      expect(feature.properties).toEqual({
        longitude: 0,
        latitude: 0,
        subState: 'Substate',
        state: 'State',
        country: 'Country',
        gadmid: '123',
      });
    });

    it('should handle error and return hasUnanalyzableError', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'queryGADM').mockRejectedValue(new Error('Test error'));
      const result = await service.getGeoReferenceData(feature);
      expect(result).toEqual({ hasUnanalyzableError: true });
    });
  });

  describe('composeResults', () => {
    it('should compose results', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'getGeoReferenceData').mockResolvedValue({ hasUnanalyzableError: false });
      await service.composeResults(feature);
      expect(service.getGeoReferenceData).toHaveBeenCalledWith(feature);
    });
  });

  describe('composeResultsWithGadmData', () => {
    it('should compose results with GADM data', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'addGeoReferenceData').mockResolvedValue({ hasUnanalyzableError: false });
      await service.composeResultsWithGadmData(feature);
      expect(service.addGeoReferenceData).toHaveBeenCalledWith(feature);
    });
  });

  describe('handle', () => {
    it('should handle the input with GADM 4.1 feature flag enabled', async () => {
      (featureFlagsService as jest.Mock).mockResolvedValue({
        getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue([
          {
            flagId: 'gadm41',
            flagState: true,
          },
        ]),
      });

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
        },
      };

      jest.spyOn(service, 'composeResultsWithGadmData').mockResolvedValue(undefined);
      const result = await service.handle(input);
      expect(service.composeResultsWithGadmData).toHaveBeenCalled();
      expect(result).toEqual(input);
    });

    it('should handle the input with GADM 4.1 feature flag disabled', async () => {
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
        },
      };

      jest.spyOn(service, 'composeResults').mockResolvedValue(undefined);
      const result = await service.handle(input);
      expect(service.composeResults).toHaveBeenCalled();
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

      const result = await service.handle(input);
      expect(result).toEqual(input);
    });
  });
});
