import { GeoService, FeatureCollection } from '@wri-monorepos/geo';
import { getListAttributes, ListAttributes, ListsAttrsTypes } from '@wri-monorepos/sql';
import { assembleGeojson } from './assemble.geojson';

// Mock dependencies
jest.mock('@wri-monorepos/geo');
jest.mock('@wri-monorepos/sql');

describe('assembleGeojson', () => {
  let mockGeoService: jest.Mocked<GeoService>;
  let mockClientDatabase: unknown;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup GeoService mock
    mockGeoService = {
      createGeoJSON: jest.fn(),
    } as unknown as jest.Mocked<GeoService>;

    (GeoService as jest.Mock).mockImplementation(() => mockGeoService);

    mockClientDatabase = {};
  });

  it('should reject when GeoJSON creation fails', async () => {
    const mockUploadingData: Array<{ location_id: string }> = [];
    const mockFeatProps: Array<{ name: string }> = [];
    const mockListId = '123';

    mockGeoService.createGeoJSON.mockReturnValue(null);

    await expect(
      assembleGeojson(mockFeatProps, mockUploadingData, mockClientDatabase, mockListId)
    ).rejects.toBe('GEO JSON creation not success');
  });

  it('should successfully create GeoJSON with expanded attributes', async () => {
    const mockUploadingData: Array<{ location_id: string }> = [
      { location_id: '1' },
      { location_id: '2' },
    ];

    const mockFeatProps: Array<{ name: string }> = [{ name: 'Location 1' }, { name: 'Location 2' }];

    const mockListId = '123';

    const mockGeoJSON: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            location_id: '1',
            attributes: JSON.stringify({ attr1: 'value1', attr2: 123 }),
          },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
        {
          type: 'Feature',
          properties: {
            location_id: '2',
            attributes: JSON.stringify({ attr1: 'value2', attr2: 456 }),
          },
          geometry: { type: 'Point', coordinates: [1, 1] },
        },
      ],
    };

    const mockListAttributes: ListAttributes[] = [
      { attribute_name: 'attr1', attribute_type: ListsAttrsTypes.Text, list_id: 123 },
      { attribute_name: 'attr2', attribute_type: ListsAttrsTypes.Number, list_id: 123 },
    ];

    mockGeoService.createGeoJSON.mockReturnValue(mockGeoJSON);
    (getListAttributes as jest.Mock).mockResolvedValue(mockListAttributes);

    const result = await assembleGeojson(
      mockFeatProps,
      mockUploadingData,
      mockClientDatabase,
      mockListId
    );

    const expectedResult: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Location 1',
            attr1: 'a',
            attr2: 1,
          },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
        {
          type: 'Feature',
          properties: {
            name: 'Location 2',
            attr1: 'a',
            attr2: 1,
          },
          geometry: { type: 'Point', coordinates: [1, 1] },
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle empty attributes', async () => {
    const mockUploadingData: Array<{ location_id: string }> = [{ location_id: '1' }];
    const mockFeatProps: Array<{ name: string }> = [{ name: 'Location 1' }];
    const mockListId = '123';

    const mockGeoJSON: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            location_id: '1',
            attributes: '',
          },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      ],
    };

    mockGeoService.createGeoJSON.mockReturnValue(mockGeoJSON);
    (getListAttributes as jest.Mock).mockResolvedValue([]);

    const result = await assembleGeojson(
      mockFeatProps,
      mockUploadingData,
      mockClientDatabase,
      mockListId
    );

    const expectedResult: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Location 1',
          },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle invalid JSON in attributes', async () => {
    const mockUploadingData: Array<{ location_id: string }> = [{ location_id: '1' }];
    const mockFeatProps: Array<{ name: string }> = [{ name: 'Location 1' }];
    const mockListId = '123';

    const mockGeoJSON: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            location_id: '1',
            attributes: 'invalid-json',
          },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      ],
    };

    mockGeoService.createGeoJSON.mockReturnValue(mockGeoJSON);
    (getListAttributes as jest.Mock).mockResolvedValue([
      { attribute_name: 'attr1', attribute_type: ListsAttrsTypes.Text, list_id: 123 },
    ]);

    const result = await assembleGeojson(
      mockFeatProps,
      mockUploadingData,
      mockClientDatabase,
      mockListId
    );

    const expectedResult: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Location 1',
          },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
