import { Test, TestingModule } from '@nestjs/testing';
import { GADMService } from './gadm.service';
import { S3Service } from '@wri-monorepos/aws';
import { Feature } from '@wri-monorepos/geo';
import { ChainType } from './types';

jest.mock('@wri-monorepos/aws');
jest.mock('@aws-sdk/client-lambda');
jest.mock('@esri/arcgis-rest-feature-service');

describe('GADMService', () => {
  let service: GADMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GADMService, S3Service],
    }).compile();

    service = module.get<GADMService>(GADMService);
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
        substate: 'Substate',
        state: 'State',
        country: 'Country',
        gadmid: '123',
      });
    });
  });

  describe('composeResults', () => {
    it('should compose results', async () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { longitude: 0, latitude: 0 },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      jest.spyOn(service, 'getGeoReferenceData').mockResolvedValue();
      await service.composeResults(feature);
      expect(service.getGeoReferenceData).toHaveBeenCalledWith(feature);
    });
  });

  describe('handle', () => {
    it('should handle the input', async () => {
      const input: ChainType = {
        geojson: { type: 'FeatureCollection', features: [] },
        request: { listId: 1, organization_database: 'test', path: 'test' },
      };
      jest.spyOn(service, 'getGADM').mockResolvedValue({ type: 'FeatureCollection', features: [] });
      const result = await service.handle(input);
      expect(result.geojson).toEqual({ type: 'FeatureCollection', features: [] });
    });
  });
});
