import { Test, TestingModule } from '@nestjs/testing';
import { ParserData } from './parser.data';
import { Logger } from '@nestjs/common';
import { FeatureCollection } from '@wri-monorepos/geo';
import * as fs from 'fs';
import { csv2geojson } from '../parser/csv2geojson.parser';
import { convertShapefileToGeoJSON } from '../parser/shp2GeoJson.parser';
import { xls2geojson } from '../parser/xls2GeoJSON.parser';
import { kml2GeoJSON } from '../parser/kml2GeoJSON.parser';
import AdmZip from 'adm-zip';
import type * as fsType from 'fs';
import { EmptyDataFileException } from '../../common/emptyDataFile.exception';

jest.mock('fs', () => {
  const actualFs: typeof fsType = jest.requireActual('fs');

  return {
    __esModule: true, // keep ESM interop happy
    ...actualFs, // everything else stays real
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    promises: {
      ...actualFs.promises,
      access: jest.fn(),
    },
  };
});

jest.mock('../parser/csv2geojson.parser');
jest.mock('../parser/shp2GeoJson.parser');
jest.mock('../parser/xls2GeoJSON.parser');
jest.mock('../parser/kml2GeoJSON.parser');
jest.mock('adm-zip');

describe('ParserData', () => {
  let parserData: ParserData;
  const mockFeatureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: { locationName: 'Test Location' },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParserData, Logger],
    }).compile();

    parserData = module.get<ParserData>(ParserData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('removeTemplateLines', () => {
    it('should filter out features with template strings in locationName', () => {
      const inputGeoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { 'Location Name': 'Valid Location' },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1, 1] },
            properties: { 'Location Name': 'Mandatory \n' },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2, 2] },
            properties: { 'Location Name': ' String ' },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3, 3] },
            properties: { 'Location Name': 'name of the location' },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [4, 4] },
            properties: { 'Location Name': 'POPULATE WITH DATA BELOW THIS LINE' },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [5, 5] },
            properties: { 'Location Name': null },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [6, 6] },
            properties: {},
          },
        ],
      };

      const result = parserData['removeTemplateLines'](inputGeoJson);
      expect(result.features).toHaveLength(3);
      expect(result.features[0].properties.locationName).toBe('Valid Location');
      expect(result.features[1].properties.locationName).toBe(null);
      expect(result.features[2].properties.locationName).toBe(undefined);
    });

    it('should handle empty or invalid GeoJSON', () => {
      const emptyGeoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      const nullGeoJson = null;

      const result1 = parserData['removeTemplateLines'](emptyGeoJson);
      const result2 = parserData['removeTemplateLines'](nullGeoJson);

      expect(result1.features).toHaveLength(0);
      expect(result2).toBeNull();
    });
  });

  describe('csvParser', () => {
    it('should parse CSV file correctly', async () => {
      const filePath = 'test.csv';
      const mockCsvContent = 'header1,header2\nvalue1,value2';
      (fs.readFileSync as jest.Mock).mockReturnValue(mockCsvContent);
      (csv2geojson as jest.Mock).mockResolvedValue(mockFeatureCollection);

      const result = await parserData['csvParser'](filePath, false);

      expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
      expect(csv2geojson).toHaveBeenCalledWith(mockCsvContent, false);
      expect(result).toEqual(mockFeatureCollection);
    });
  });

  describe('shapefileParser', () => {
    it('should parse shapefile correctly', async () => {
      const filePath = 'test.zip';
      (convertShapefileToGeoJSON as jest.Mock).mockResolvedValue(mockFeatureCollection);

      const result = await parserData['shapefileParser'](filePath);

      expect(convertShapefileToGeoJSON).toHaveBeenCalledWith(filePath);
      expect(result).toEqual(mockFeatureCollection);
    });
  });

  describe('xls2geojson', () => {
    it('should parse Excel file correctly', async () => {
      const filePath = 'test.xlsx';
      const mockBuffer = Buffer.from('test');
      (fs.readFileSync as jest.Mock).mockReturnValue(mockBuffer);
      (xls2geojson as jest.Mock).mockResolvedValue(mockFeatureCollection);

      const result = await parserData['xls2geojson'](filePath);

      expect(fs.readFileSync).toHaveBeenCalledWith(filePath);
      expect(xls2geojson).toHaveBeenCalledWith(mockBuffer);
      expect(result).toEqual(mockFeatureCollection);
    });
  });

  describe('kml2geojson', () => {
    it('should parse KML file correctly', async () => {
      const filePath = 'test.kml';
      const mockKmlContent = '<kml>...</kml>';
      (fs.readFileSync as jest.Mock).mockReturnValue(mockKmlContent);
      (kml2GeoJSON as jest.Mock).mockResolvedValue(mockFeatureCollection);

      const result = await parserData['kml2geojson'](filePath);

      expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
      expect(kml2GeoJSON).toHaveBeenCalledWith(mockKmlContent);
      expect(result).toEqual(mockFeatureCollection);
    });
  });

  describe('json2geojson', () => {
    it('should parse JSON file correctly', async () => {
      const filePath = 'test.json';
      const mockJsonString = JSON.stringify(mockFeatureCollection);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockJsonString);

      const result = await parserData['json2geojson'](filePath);

      expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
      expect(result).toEqual(mockFeatureCollection);
    });
  });

  describe('kmz2geojson', () => {
    it('should parse KMZ file correctly', async () => {
      const filePath = 'test.kmz';
      const mockKmlContent = '<kml>...</kml>';
      const mockZipEntry = {
        entryName: 'test.kml',
        getData: jest.fn().mockReturnValue(mockKmlContent),
      };
      const mockZip = {
        getEntries: jest.fn().mockReturnValue([mockZipEntry]),
      };
      (AdmZip as jest.Mock).mockImplementation(() => mockZip);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockKmlContent);
      (kml2GeoJSON as jest.Mock).mockResolvedValue(mockFeatureCollection);

      const result = await parserData['kmz2geojson'](filePath);

      expect(AdmZip).toHaveBeenCalledWith(filePath);
      expect(mockZip.getEntries).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('.kml'), 'utf8');
      expect(kml2GeoJSON).toHaveBeenCalledWith(mockKmlContent);
      expect(result).toEqual(mockFeatureCollection);
    });

    it('should throw error if no KML file found in KMZ', async () => {
      const filePath = 'test.kmz';
      const mockZip = {
        getEntries: jest.fn().mockReturnValue([]),
      };
      (AdmZip as jest.Mock).mockImplementation(() => mockZip);

      await expect(parserData['kmz2geojson'](filePath)).rejects.toThrow(
        'No KML file found in the KMZ archive'
      );
    });
  });

  describe('handle', () => {
    it('should handle CSV file processing correctly', async () => {
      const request = {
        request: {
          fileDownloadedPath: 'test.csv',
          preview: false,
          path: 'test/path',
        },
      };
      const mockCsvContent = 'header1,header2\nvalue1,value2';
      (fs.readFileSync as jest.Mock).mockReturnValue(mockCsvContent);
      (csv2geojson as jest.Mock).mockResolvedValue(mockFeatureCollection);

      const result = await parserData.handle(request);

      expect(result).toEqual({
        ...request,
        geojson: mockFeatureCollection,
      });
    });

    it('should throw EmptyDataFileException when parsed file has no features', async () => {
      const request = {
        request: {
          fileDownloadedPath: 'test.csv',
          preview: false,
          path: 'test/path',
        },
      };
      const mockCsvContent = 'header1,header2\nvalue1,value2';
      (fs.readFileSync as jest.Mock).mockReturnValue(mockCsvContent);
      (csv2geojson as jest.Mock).mockResolvedValue({
        type: 'FeatureCollection',
        features: [],
      });

      await expect(parserData.handle(request)).rejects.toBeInstanceOf(EmptyDataFileException);
    });

    it('should throw error for unsupported file extension', async () => {
      const request = {
        request: {
          fileDownloadedPath: 'test.unsupported',
          preview: false,
          path: 'test/path',
        },
      };

      await expect(parserData.handle(request)).rejects.toThrow('Unsupported file extension');
    });

    it('should throw error when parsing fails', async () => {
      const request = {
        request: {
          fileDownloadedPath: 'test.csv',
          preview: false,
          path: 'test/path',
        },
      };
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File read error');
      });

      await expect(parserData.handle(request)).rejects.toThrow('Error while parsing the data');
    });
  });
});
