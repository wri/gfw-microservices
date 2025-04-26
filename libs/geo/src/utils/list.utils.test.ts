import * as sinon from 'sinon';
import { DataSource } from 'typeorm';
import { ListsAnalysisStatus } from '@wri-monorepos/sql';
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
  GetTemplateId,
  setListAnalysisStatus,
} from './list.utils';

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

  describe('GetTemplateId', () => {
    it('should return template id from template data', () => {
      const templateData = [{ template_id: 123 }];
      expect(GetTemplateId(templateData)).toBe(123);
    });

    it('should return -1 when template data is empty', () => {
      expect(GetTemplateId([])).toBe(-1);
    });

    it('should return -1 when template data is null', () => {
      expect(GetTemplateId(null)).toBe(-1);
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
    class LASMockRepository {
      findBy = jest.fn(() => ({ length: 0 }));
      save = jest.fn();
    }
    const baseValues = {
      errorInfo: null,
      updateTime: expect.any(String),
      s3URL: null,
      expirationTime: null,
      bundleCreationTime: null,
      options: null,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      sinon.restore();
    });
    it('should create analysis status records', async () => {
      const lasMock = new LASMockRepository();
      sinon
        .stub(DataSource.prototype, 'getRepository')
        .withArgs(ListsAnalysisStatus)
        .returns(lasMock);

      await setListAnalysisStatus('clientDatabase', 1, ['analysis1'], 2);
      expect(lasMock.findBy).toHaveBeenCalledWith({
        listId: 1,
        analysisId: 'analysis1',
      });
      expect(lasMock.save).toHaveBeenCalledWith({
        listId: 1,
        analysisId: 'analysis1',
        status: 2,
        ...baseValues,
      });
    });

    it('should not create a status record for PalmRisk, but should pass options="PalmRisk" if FCD is also present', async () => {
      const lasMock = new LASMockRepository();
      sinon
        .stub(DataSource.prototype, 'getRepository')
        .withArgs(ListsAnalysisStatus)
        .returns(lasMock);

      // both "FCD" and "PalmRisk" in the array (along with "analysisX" to show multiple IDs).
      const analysisIds = ['analysisX', 'FCD', 'PalmRisk'];

      await setListAnalysisStatus('clientDatabase', 100, analysisIds, 200);
      expect(lasMock.findBy).toHaveBeenCalledTimes(2);

      // 1) For "analysisX" (no options parameter):
      expect(lasMock.save).toHaveBeenNthCalledWith(1, {
        listId: 100,
        analysisId: 'analysisX',
        status: 200,
        ...baseValues,
      });

      // 2) For "FCD" (with options="PalmRisk"):
      expect(lasMock.save).toHaveBeenNthCalledWith(2, {
        listId: 100,
        analysisId: 'FCD',
        status: 200,
        ...baseValues,
        options: 'PalmRisk',
      });
    });

    it('should not include options if PalmRisk is not in the array, even if FCD is present', async () => {
      const lasMock = new LASMockRepository();
      sinon
        .stub(DataSource.prototype, 'getRepository')
        .withArgs(ListsAnalysisStatus)
        .returns(lasMock);

      const analysisIds = ['analysisX', 'FCD'];

      await setListAnalysisStatus('clientDatabase', 10, analysisIds, 20);

      expect(lasMock.findBy).toHaveBeenCalledTimes(2);

      // check that for FCD, no 'options' field is present
      expect(lasMock.save).toHaveBeenNthCalledWith(2, {
        listId: 10,
        analysisId: 'FCD',
        status: 20,
        ...baseValues,
      });
    });
  });
});
