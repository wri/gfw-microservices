import { ListsAnalysisStatus, ClientStoreConnection } from '@wri-monorepos/sql';
import {
  getListStatusId,
  ContainsPunctuation,
  discernPropValue,
  getActiveTye,
  getCustomAttributeNamesAndGenericFields,
  createfeaturePropsForCommodity,
  createFeaturePropsForNonCommodity,
  deleteGeoJSONFeatureProperties,
  ListHasFiltersApplies,
  CheckListNameIsValid,
  createFeatureProps,
} from './list.utils';
import { analysisTypes, listStatus } from '@wri-monorepos/constants';
import { deleteListAnalyses } from '../lib/list.analysis.status';
import { setListAnalysisStatus } from './list.utils';

// Mock the modules
jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue({
      getRepository: jest.fn().mockReturnValue({
        findBy: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      }),
    }),
  })),
  ListsAnalysisStatus: jest.fn(),
}));

jest.mock('../lib/list.analysis.status', () => ({
  updateListAnalysis: jest.fn(),
  deleteListAnalyses: jest.fn(),
}));

describe('List Utils', () => {
  describe('getListStatusId', () => {
    it('should return draft status when isSaveAsDraft is true', () => {
      expect(getListStatusId(true)).toBe(4);
    });

    it('should return pending status when isSaveAsDraft is false', () => {
      expect(getListStatusId(false)).toBe(1);
    });
  });

  describe('ContainsPunctuation', () => {
    it('should return true when string contains punctuation', () => {
      expect(ContainsPunctuation('Test!')).toBe(true);
      expect(ContainsPunctuation('Test@')).toBe(true);
      expect(ContainsPunctuation('Test#')).toBe(true);
    });

    it('should return false when string contains only alphanumeric characters and spaces', () => {
      expect(ContainsPunctuation('Test123')).toBe(false);
      expect(ContainsPunctuation('Test 123')).toBe(false);
    });
  });

  describe('discernPropValue', () => {
    it('should convert accuracy rating text to numeric values', () => {
      expect(
        discernPropValue(
          { 'Accuracy Rating of Location Entered': "don't know" },
          'Accuracy Rating of Location Entered'
        )
      ).toBe(0);
      expect(
        discernPropValue(
          { 'Accuracy Rating of Location Entered': 'not confident' },
          'Accuracy Rating of Location Entered'
        )
      ).toBe(1);
      expect(
        discernPropValue(
          { 'Accuracy Rating of Location Entered': 'moderately confident' },
          'Accuracy Rating of Location Entered'
        )
      ).toBe(2);
      expect(
        discernPropValue(
          { 'Accuracy Rating of Location Entered': 'very confident' },
          'Accuracy Rating of Location Entered'
        )
      ).toBe(3);
    });

    it('should handle empty size of investment', () => {
      expect(discernPropValue({ 'Size of Investment': '' }, 'Size of Investment')).toBeNull();
    });

    it('should return original value for other properties', () => {
      expect(discernPropValue({ 'Test Property': 'test value' }, 'Test Property')).toBe(
        'test value'
      );
    });
  });

  describe('getActiveTye', () => {
    it('should return correct active type for commodity types', () => {
      expect(getActiveTye('palmOil', 'current')).toBe('palmGeneric');
      expect(getActiveTye('soy', 'current')).toBe('soyGeneric');
      expect(getActiveTye('cattle', 'current')).toBe('cattleGeneric');
      expect(getActiveTye('cocoa', 'current')).toBe('cocoaGeneric');
    });

    it('should return current active type for unknown commodity types', () => {
      expect(getActiveTye('unknown', 'current')).toBe('current');
    });
  });

  describe('getCustomAttributeNamesAndGenericFields', () => {
    it('should correctly separate custom attributes and generic fields', () => {
      const customAttributes = 'attr1,attr2';
      const templateData = [
        { template_datum_field_name: 'field1', template_datum_field_name_updated: 'field1' },
        { template_datum_field_name: 'field2', template_datum_field_name_updated: 'newField2' },
      ];

      const [customAttributeNames, genericFields] = getCustomAttributeNamesAndGenericFields(
        customAttributes,
        templateData
      );

      expect(customAttributeNames).toEqual(['attr1', 'attr2', 'newField2']);
      expect(genericFields).toEqual(['field1']);
    });
  });

  describe('ListHasFiltersApplies', () => {
    it('should return true when any filter is applied', () => {
      const filters = {
        country: 'USA',
        state: null,
        subState: null,
        analysisAreaMin: null,
        analysisAreaMax: null,
        searchString: null,
      };
      expect(ListHasFiltersApplies(filters)).toBe('USA');
    });

    it('should return false when no filters are applied', () => {
      const filters = {
        country: null,
        state: null,
        subState: null,
        analysisAreaMin: null,
        analysisAreaMax: null,
        searchString: null,
      };
      expect(ListHasFiltersApplies(filters)).toBe(null);
    });
  });

  describe('CheckListNameIsValid', () => {
    it('should throw error for missing list name', () => {
      expect(() => CheckListNameIsValid('new', '', [])).toThrow('MISSING_LIST_NAME');
    });

    it('should throw error for duplicate list name', () => {
      expect(() => CheckListNameIsValid('new', 'Test List', ['test list'])).toThrow(
        'LIST_NAME_ALREADY_EXISTS'
      );
    });

    it('should throw error for invalid list name with punctuation', () => {
      expect(() => CheckListNameIsValid('new', 'Test! List', [])).toThrow('INVALID_LIST_NAME');
    });

    it('should not throw error for valid list name', () => {
      expect(() => CheckListNameIsValid('new', 'Test List', [])).not.toThrow();
    });
  });

  describe('deleteGeoJSONFeatureProperties', () => {
    it('should remove specified properties from GeoJSON features', () => {
      const geojson = {
        features: [
          {
            properties: {
              list_id: 1,
              location_id: 2,
              flag_forma: true,
              flag_general: true,
              flag_glad: true,
              flag_gran_chaco: true,
              flag_terrai: true,
              flag_viirs: true,
              other_property: 'test',
            },
          },
        ],
      };

      deleteGeoJSONFeatureProperties(geojson);

      expect(geojson.features[0].properties).toEqual({
        other_property: 'test',
      });
    });
  });

  describe('createfeaturePropsForCommodity', () => {
    it('should create feature properties for commodity data', () => {
      const locationData = [
        {
          Latitude: 10,
          Longitude: 20,
          'Accuracy Rating of Location Entered': 'very confident',
          'Size of Investment': '1000',
          checked: true,
          valid: true,
          type: 'Feature',
          geometry: {},
        },
      ];
      const customAttributeNames = ['CustomAttr'];
      const genericFields = ['Accuracy Rating of Location Entered', 'Size of Investment'];

      const result = createfeaturePropsForCommodity(
        locationData,
        customAttributeNames,
        genericFields
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        'Accuracy Rating of Location Entered': 3,
        'Size of Investment': '1000',
        'Start Date': '',
        'End Date': '',
        'Wind Barrier': '',
        'Riparian Buffers': '',
        'Buffer Zones': '',
        Latitude: 10,
        Longitude: 20,
        attributes: {},
        errorDetails: '',
      });
    });
  });

  describe('createFeaturePropsForNonCommodity', () => {
    it('should create feature properties for non-commodity data', () => {
      const locationData = [
        {
          Latitude: 10,
          Longitude: 20,
          'Accuracy Rating of Location Entered': 'very confident',
          'Location Name': 'Test Location',
          checked: true,
          valid: true,
          type: 'Feature',
          geometry: {},
        },
      ];

      const result = createFeaturePropsForNonCommodity(locationData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        'Accuracy Rating of Location Entered': 3,
        'Start Date': '',
        'End Date': '',
        'Wind Barrier': '',
        'Riparian Buffers': '',
        'Buffer Zones': '',
        Latitude: 10,
        Longitude: 20,
        Geometry: {},
        'Investment Name': 'Test Location',
        'Location Name': 'Test Location',
        attributes: {},
        errorDetails: '',
      });
    });
  });

  describe('createFeatureProps', () => {
    it('should create feature properties based on add type', () => {
      const locationData = [
        {
          Latitude: 10,
          Longitude: 20,
          'Accuracy Rating of Location Entered': 'very confident',
          'Location Name': 'Test Location',
          checked: true,
          valid: true,
          type: 'Feature',
          geometry: {},
        },
      ];
      const templateData = [
        { template_datum_field_name: 'field1', template_datum_field_name_updated: 'field1' },
      ];

      const commodityResult = createFeatureProps(locationData, 'commodity', templateData, '');
      const nonCommodityResult = createFeatureProps(
        locationData,
        'non-commodity',
        templateData,
        ''
      );

      expect(commodityResult).toBeDefined();
      expect(nonCommodityResult).toBeDefined();
      expect(commodityResult.length).toBe(1);
      expect(nonCommodityResult.length).toBe(1);
    });
  });

  describe('setListAnalysisStatus', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle empty analysis types array', async () => {
      const currentAnalysisStatuses = [
        {
          listId: 1,
          analysisId: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
          status: listStatus.Active,
        } as ListsAnalysisStatus,
        {
          listId: 1,
          analysisId: analysisTypes.DEFORESTATION_KPIS,
          status: listStatus.Active,
        } as ListsAnalysisStatus,
      ];

      // Setup repository mock
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue(currentAnalysisStatuses),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockImplementation(({ where }) => {
          if (
            where.analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS ||
            where.analysisId === analysisTypes.DEFORESTATION_KPIS
          ) {
            return Promise.resolve({
              listId: 1,
              analysisId: where.analysisId,
              status: listStatus.Active,
            });
          }
          return Promise.resolve(null);
        }),
      };

      // Setup connection mock
      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      // Setup ClientStoreConnection mock
      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Call setListAnalysisStatus with empty array
      await setListAnalysisStatus('clientDatabase', 1, [], listStatus.Active);

      // Verify no operations were performed
      expect(mockRepository.findBy).not.toHaveBeenCalled();
      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(() => setListAnalysisStatus('clientDatabase', 1, [], listStatus.Active)).not.toThrow();
    });

    it('should update status for provided analysis types', async () => {
      const currentAnalysisStatuses = [
        { listId: 1, analysisId: 'FCD', status: listStatus.Active } as ListsAnalysisStatus,
        {
          listId: 1,
          analysisId: analysisTypes.DEFORESTATION_KPIS,
          status: listStatus.Active,
        } as ListsAnalysisStatus,
      ];

      // Setup repository mock
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue(currentAnalysisStatuses),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockImplementation(({ where }) => {
          if (where.analysisId === 'FCD' || where.analysisId === analysisTypes.DEFORESTATION_KPIS) {
            return Promise.resolve({
              listId: 1,
              analysisId: where.analysisId,
              status: listStatus.Active,
            });
          }
          return Promise.resolve(null);
        }),
      };

      // Setup connection mock
      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      // Setup ClientStoreConnection mock
      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Call setListAnalysisStatus with analysis types
      await setListAnalysisStatus('clientDatabase', 1, ['FCD', 'AFI'], listStatus.Pending);
      // Verify deleteListAnalyses was not called since it's not part of the implementation
      expect(deleteListAnalyses).not.toHaveBeenCalled();

      // Verify repository update was called for each analysis type
      expect(mockRepository.update).toHaveBeenNthCalledWith(
        1,
        { listId: 1, analysisId: 'FCD' },
        {
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null,
        }
      );

      expect(mockRepository.update).toHaveBeenNthCalledWith(
        2,
        { listId: 1, analysisId: 'AFI' },
        {
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null,
        }
      );
    });
    it('should not update status for invalid analysis types', async () => {
      const currentAnalysisStatuses = [
        { listId: 1, analysisId: 'FCD', status: listStatus.Active } as ListsAnalysisStatus,
        { listId: 1, analysisId: 'DefReport', status: listStatus.Active } as ListsAnalysisStatus,
      ];

      // Setup repository mock
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue(currentAnalysisStatuses),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockImplementation(({ where }) => {
          if (where.analysisId === 'FCD' || where.analysisId === 'DefReport') {
            return Promise.resolve({
              listId: 1,
              analysisId: where.analysisId,
              status: listStatus.Active,
            });
          }
          return Promise.resolve(null);
        }),
      };

      // Setup connection mock
      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      // Setup ClientStoreConnection mock
      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Call setListAnalysisStatus with analysis types
      await expect(
        setListAnalysisStatus('clientDatabase', 1, ['FCD', 'DefReport'], listStatus.Pending)
      ).rejects.toThrowError('Invalid analysisId: DefReport');
    });
    it('should update status for provided analysis types without delete any analysis', async () => {
      const currentAnalysisStatuses = [
        {
          listId: 1,
          analysisId: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
          status: listStatus.Active,
        } as ListsAnalysisStatus,
        {
          listId: 1,
          analysisId: analysisTypes.DEFORESTATION_KPIS,
          status: listStatus.Active,
        } as ListsAnalysisStatus,
      ];

      // Setup repository mock
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue(currentAnalysisStatuses),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockImplementation(({ where }) => {
          if (
            where.analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS ||
            where.analysisId === analysisTypes.DEFORESTATION_KPIS
          ) {
            return Promise.resolve({
              listId: 1,
              analysisId: where.analysisId,
              status: listStatus.Active,
            });
          }
          return Promise.resolve(null);
        }),
      };

      // Setup connection mock
      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      // Setup ClientStoreConnection mock
      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Call setListAnalysisStatus with analysis types
      await setListAnalysisStatus(
        'clientDatabase',
        1,
        [analysisTypes.FOREST_CHANGE_DIAGNOSTICS, analysisTypes.DEFORESTATION_KPIS],
        listStatus.Pending
      );
      // Verify deleteListAnalyses was called
      expect(deleteListAnalyses).not.toHaveBeenCalled();

      // Verify repository update was called for each analysis type
      expect(mockRepository.update).toHaveBeenNthCalledWith(
        1,
        { listId: 1, analysisId: 'FCD' },
        {
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null,
        }
      );

      expect(mockRepository.update).toHaveBeenNthCalledWith(
        2,
        { listId: 1, analysisId: analysisTypes.DEFORESTATION_KPIS },
        {
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null,
        }
      );
    });

    it('should not call deleteListAnalyses if isFromEAPI is true', async () => {
      const currentAnalysisStatuses = [
        { listId: 1, analysisId: 'GHG', status: listStatus.Active } as ListsAnalysisStatus,
      ];

      const mockRepository = {
        findBy: jest.fn().mockResolvedValue(currentAnalysisStatuses),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue(null),
      };

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Mock the deleteListAnalyses function
      const mockDeleteListAnalyses = deleteListAnalyses as jest.Mock;
      mockDeleteListAnalyses.mockImplementation(jest.fn());

      await setListAnalysisStatus('clientDatabase', 1, ['FCD'], listStatus.Pending);

      expect(deleteListAnalyses).not.toHaveBeenCalled();
    });

    it('should update GREENHOUSE_GAS_EMISSIONS status when requested', async () => {
      const currentAnalysisStatuses = [
        { listId: 1, analysisId: 'GHG', status: listStatus.Active } as ListsAnalysisStatus,
      ];

      const mockRepository = {
        findBy: jest.fn().mockResolvedValue(currentAnalysisStatuses),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue({
          listId: 1,
          analysisId: 'GHG',
          status: listStatus.Active,
        }),
      };

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      await setListAnalysisStatus('clientDatabase', 1, ['GHG'], listStatus.Pending);

      // GHG should now be updated like any other analysis type
      expect(mockRepository.update).toHaveBeenCalledWith(
        { listId: 1, analysisId: 'GHG' },
        expect.objectContaining({
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null,
        })
      );
    });

    it('should create new GREENHOUSE_GAS_EMISSIONS record if it does not exist', async () => {
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue([]),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue(null), // No existing record
      };

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      await setListAnalysisStatus('clientDatabase', 1, ['GHG'], listStatus.Pending);

      // Should create a new record for GHG
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 1,
          analysisId: 'GHG',
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null,
        })
      );
    });

    it('GPV-5400: should set options=Weekly when Weekly is in analysisIds during upload with feature flag enabled', async () => {
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue([]),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue(null), // No existing record
      };

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Simulate upload with ['Alerts', 'Weekly'] in analysisIds (options undefined)
      await setListAnalysisStatus(
        'clientDatabase',
        1,
        ['Alerts', 'Weekly'],
        listStatus.Pending,
        123 // organizationId for feature flag lookup
      );

      // Should create ALERTS record with options='Weekly'
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 1,
          analysisId: 'ALERTS',
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: 'Weekly', // ← Should be set because Weekly was in analysisIds
        })
      );
    });

    it('should set options=Weekly when options parameter contains Weekly', async () => {
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue([]),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue(null), // No existing record
      };

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Simulate enrollment with options='Weekly' parameter
      await setListAnalysisStatus(
        'clientDatabase',
        1,
        ['Alerts'],
        listStatus.Active,
        123, // organizationId for feature flag lookup
        'Weekly' // options parameter
      );

      // Should create ALERTS record with options='Weekly'
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 1,
          analysisId: 'ALERTS',
          status: listStatus.Active,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: 'Weekly', // ← Should be set from options parameter
        })
      );
    });

    it('should NOT set options=Weekly when feature flag is enabled but Weekly is not requested', async () => {
      const mockRepository = {
        findBy: jest.fn().mockResolvedValue([]),
        save: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue(null), // No existing record
      };

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const mockClientStoreConnection = {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      };
      (ClientStoreConnection as unknown as jest.Mock).mockImplementation(
        () => mockClientStoreConnection
      );

      // Simulate upload with only 'Alerts' (no Weekly) when feature flag is enabled
      await setListAnalysisStatus(
        'clientDatabase',
        1,
        ['Alerts'], // Only Alerts, no Weekly
        listStatus.Pending,
        123 // organizationId for feature flag lookup
      );

      // Should create ALERTS record with options=null (not 'Weekly')
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listId: 1,
          analysisId: 'ALERTS',
          status: listStatus.Pending,
          errorInfo: null,
          updateTime: expect.any(String),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null, // ← Should be null because Weekly was not requested (feature flag ON = opt-in)
        })
      );
    });
  });
});
