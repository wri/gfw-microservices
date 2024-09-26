import { ParserData } from './parser.data';
import { csv2geojson } from '../parser/csv2geojson.parser';
import * as fs from 'fs';
import { ChainType } from './types';
// Mock dependencies
jest.mock('fs');
jest.mock('../parser/csv2geojson.parser');
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
  })),
}));

describe('ParserData', () => {
  let parserData: ParserData;

  beforeEach(() => {
    parserData = new ParserData();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should read the CSV file, convert it to GeoJSON, and pass it to the next handler', async () => {
    const mockCsvContent = 'id,name\n1,Test\n';
    const mockGeoJson = { type: 'FeatureCollection', features: [] };
    const input: ChainType = {
      request: {
        userId: 1,
        list_name: 'test',
        organization_database: 'test-db',
        templateId: 1,
        path: 'test/path',
        fileDownloadedPath: 'path/to/file.csv',
      },
    };

    (fs.readFileSync as jest.Mock).mockReturnValue(mockCsvContent);
    (csv2geojson as jest.Mock).mockResolvedValue(mockGeoJson);

    const response = await parserData.handle(input);

    expect(fs.readFileSync).toHaveBeenCalledWith('path/to/file.csv', 'utf8');
    expect(response).toStrictEqual({ ...input, geojson: mockGeoJson });
  });
});
