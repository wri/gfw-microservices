import { ProcessUploadData } from './process.upload.data';
import { Feature } from '@wri-monorepos/geo';
import { ChainType, RequestNewList } from './types';
import { ClientStoreConnection } from '@wri-monorepos/sql';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue({
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ Commodity: 'MOCKED_COMMODITY' }),
      }),
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
      }),
    }),
  })),
  Lists: class {},
  getListsLocsColumnsToExclude: jest.fn().mockReturnValue(['excluded_col1']),
  getFormattedAttributes: jest.fn().mockImplementation(({ listId, attributeField, fieldValue }) => {
    return {
      list_id: listId,
      attribute_name: attributeField,
      attribute_type: typeof fieldValue === 'number' ? 1 : 2,
    };
  }),
  getListAttributes: jest.fn().mockResolvedValue([
    { attribute_name: 'attr1', attribute_type: 1 },
    { attribute_name: 'attr2', attribute_type: 2 },
  ]),
  saveListAttributes: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('wellknown', () => ({
  stringify: jest.fn().mockResolvedValue('geom string'),
}));

jest.mock('./convert.point.2.polygon', () => ({
  ConvertPoint2Polygon: jest.fn().mockImplementation(() => ({
    convertFeature: jest.fn(),
  })),
}));

describe('ProcessUploadData', () => {
  let processUploadData: ProcessUploadData;
  let convertFeatureSpy: jest.SpyInstance;

  beforeAll(async () => {
    processUploadData = new ProcessUploadData();

    convertFeatureSpy = jest
      .spyOn((processUploadData as any).convertPoint2Polygon, 'convertFeature')
      .mockImplementation(async (feature) => {
        return {
          ...(feature as object),
          geometry: { type: 'Point', coordinates: [125.6, 10.1] },
          properties: (feature as Feature).properties ?? {},
        };
      });
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getFeatureAttributes', () => {
    it('should return JSON string of valid attributes, excluding columns', () => {
      const list_id = 123;
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          valid_col: 'some_value',
          excluded_col: 'should_not_appear',
          another_col: 'another_value',
          '': 'empty_key',
        },
      };

      const result = processUploadData.processFeatureAttributes(mockFeature, list_id);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('valid_col', 'some_value');
      expect(parsed).toHaveProperty('another_col', 'another_value');
      expect(parsed).not.toHaveProperty('excluded_col1');
      expect(parsed).not.toHaveProperty('');
    });
  });

  describe('processFeature', () => {
    it('should return the feature unchanged when properties is missing', async () => {
      const mockFeatureNoProps = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [125.6, 10.1],
        },
        properties: undefined,
      };

      const locationId = 10;
      const commodity = 'WHEAT';
      const mockRequest: ChainType = {
        request: {
          list_id: 123,
          organization_database: 'org_db',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
      };

      const processed = await processUploadData.processFeature(
        mockFeatureNoProps as Feature,
        locationId,
        commodity,
        mockRequest
      );

      // be the original feature, unchanged:
      expect(processed).toBe(mockFeatureNoProps);
      expect(processed.properties).toBeUndefined();

      expect(convertFeatureSpy).not.toHaveBeenCalled();
    });
  });

  describe('getListCommodity', () => {
    it('should retrieve commodity from database', async () => {
      const commodity = await processUploadData.getListCommodity('some_org_db', 999);

      expect(commodity).toBe('MOCKED_COMMODITY');
      expect(ClientStoreConnection).toHaveBeenCalledTimes(1);

      const ClientStoreConnectionMock = ClientStoreConnection as jest.MockedClass<
        typeof ClientStoreConnection
      >;
      const instance = ClientStoreConnectionMock.mock.results[0].value;
      expect(instance.getConnection).toHaveBeenCalledWith('some_org_db');
    });
  });

  describe('getExistingListAttributes', () => {
    it('should load and store existing list attributes', async () => {
      const organization_database = 'test_db';
      const list_id = 123;

      // Clear the map before test
      (processUploadData as any).listsAttributesRecords.clear();

      await processUploadData.getExistingListAttributes(organization_database, list_id);

      // Verify getListAttributes was called with correct parameters
      const { getListAttributes } = jest.requireMock('@wri-monorepos/sql');
      expect(getListAttributes).toHaveBeenCalledWith(organization_database, list_id);

      // Verify attributes were stored in the map
      const records = (processUploadData as any).listsAttributesRecords;
      expect(records.size).toBe(2);
      expect(records.get('attr1')).toEqual({ attribute_name: 'attr1', attribute_type: 1 });
      expect(records.get('attr2')).toEqual({ attribute_name: 'attr2', attribute_type: 2 });
    });
  });

  describe('ProcessUploadData - handle method', () => {
    let processUploadData: ProcessUploadData;

    beforeEach(() => {
      processUploadData = new ProcessUploadData();
    });

    it('should call getListCommodity, getProcessedFeatures, and update request.geojson.features', async () => {
      const mockFeatures: Feature[] = [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [10, 20] },
          properties: { foo: 'bar' },
        },
      ];

      const mockRequest: ChainType = {
        request: {
          list_id: 123,
          organization_database: 'org_db',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: mockFeatures,
        },
      };

      const getListCommoditySpy = jest
        .spyOn(processUploadData, 'getListCommodity')
        .mockResolvedValue('MOCKED_COMMODITY');

      const getProcessedFeaturesSpy = jest
        .spyOn(processUploadData, 'getProcessedFeatures')
        .mockResolvedValue([{ type: 'Feature', geometry: {}, properties: {} } as Feature]);

      const result = await processUploadData.handle(mockRequest);

      expect(getListCommoditySpy).toHaveBeenCalledWith('org_db', 123);

      expect(getProcessedFeaturesSpy).toHaveBeenCalledWith(
        mockFeatures,
        'MOCKED_COMMODITY',
        mockRequest
      );

      expect(result.geojson.features).toEqual([{ type: 'Feature', geometry: {}, properties: {} }]);
    });
  });
});
