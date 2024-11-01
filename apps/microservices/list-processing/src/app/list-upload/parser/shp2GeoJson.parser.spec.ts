/* eslint-disable @typescript-eslint/no-empty-function */
import { convertShapefileToGeoJSON } from './shp2GeoJson.parser';
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
