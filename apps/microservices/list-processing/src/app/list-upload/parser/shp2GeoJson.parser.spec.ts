/* eslint-disable @typescript-eslint/no-empty-function */
import { convertShapefileToGeoJSON, convertProperties } from './shp2GeoJson.parser';
import * as fs from 'fs';
import * as shapefile from 'shapefile';

jest.mock('fs');
jest.mock('unzipper');
jest.mock('shapefile');

describe('convertShapefileToGeoJSON', () => {
  const mockZipFilePath = 'path/to/mock.zip';
  const mockShpFile = 'mock.shp';
  const mockGeoJSON = { type: 'FeatureCollection', features: [] };

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();
  });

  it('should convert a shapefile to GeoJSON', async () => {
    // Mock fs and unzipper behavior
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (fs.createReadStream as jest.Mock).mockReturnValue({
      pipe: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(undefined),
      }),
    });
    (fs.readdirSync as jest.Mock).mockReturnValue([mockShpFile]);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

    // Mock shapefile behavior
    (shapefile.read as jest.Mock).mockResolvedValue(mockGeoJSON);

    const result = await convertShapefileToGeoJSON(mockZipFilePath);

    expect(result).toEqual(mockGeoJSON);
  });

  it('should throw an error if no .shp file is found', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);

    await expect(convertShapefileToGeoJSON(mockZipFilePath)).rejects.toThrow(
      'Shapefile (.shp) not found in the zip archive'
    );
  });

  it('should clean up extracted files on error', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([mockShpFile]);
    (shapefile.read as jest.Mock).mockRejectedValue(new Error('Read error'));

    await expect(convertShapefileToGeoJSON(mockZipFilePath)).rejects.toThrow('Read error');
  });
});

describe('shp2GeoJson Parser', () => {
  describe('convertProperties', () => {
    it('should correctly map properties from shapefile format to desired format', () => {
      // First we need to make convertProperties accessible for testing
      const mockFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          Location_N: 'Test Location',
          Latitude: 0,
          Longitude: 100,
          Analysis_R: 500,
          Analysis_A: 1000,
          Location_C: 'Urban',
          Company_ID: 'COMP123',
          Volume: 5000,
          Owner_Name: 'Test Owner',
          Owner_ID: 'OWN123',
          Company_Na: 'Test Company',
          Supplier_N: 'Test Supplier',
          Facility_N: 'Test Facility',
          Refinery_N: 'Test Refinery',
          Certificat: 'ISO-9001',
          Time_Horiz: '2024',
          attribute1: 'attr1',
          attribute2: 'attr2',
          attribute3: 'attr3',
          Start_Date: '2024-01-01',
          End_Date: '2024-12-31',
        },
      };

      const result = convertProperties(mockFeature);

      expect(result).toEqual({
        geometry: {
          coordinates: [100, 0],
          type: 'Point',
        },
        properties: {
          Certification: 'ISO-9001',
          'Company ID': 'COMP123',
          'Company Name': 'Test Company',
          'End Date': '2024-12-31',
          'Facility Name': 'Test Facility',
          'Location Classification': 'Urban',
          'Owner ID': 'OWN123',
          'Owner Name': 'Test Owner',
          'Refinery Name': 'Test Refinery',
          'Start Date': '2024-01-01',
          'Supplier Name': 'Test Supplier',
          'Time Horizon': '2024',
          Volume: 5000,
          analysisArea: 1000,
          analysisRadius: 500,
          attribute1: 'attr1',
          attribute2: 'attr2',
          attribute3: 'attr3',
          latitude: 0,
          locationName: 'Test Location',
          longitude: 100,
        },
        type: 'Feature',
      });
    });

    it('should handle missing properties gracefully', () => {
      const mockFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          Location_N: 'Test Location',
          Latitude: 0,
          Longitude: 100,
        },
      };

      const result = convertProperties(mockFeature);

      expect(result).toEqual({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          locationName: 'Test Location',
          latitude: 0,
          longitude: 100,
        },
      });
    });
  });
});
