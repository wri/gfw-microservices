import { Test, TestingModule } from '@nestjs/testing';
import { ParserData } from './parser.data';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { csv2geojson } from '../parser/csv2geojson.parser';
import { AbstractHandler, ChainType } from './types';

jest.mock('fs');
jest.mock('../parser/csv2geojson.parser');

describe('ParserData', () => {
  let parserData: ParserData;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParserData, Logger],
    }).compile();

    parserData = module.get<ParserData>(ParserData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should parse CSV content and pass GeoJSON to the next handler', async () => {
      const fileDownloadedPath = 'path/to/file.csv';
      const csvContent = 'csv content';
      const geoJson = { type: 'FeatureCollection', features: [] };
      const input: ChainType = {
        request: { fileDownloadedPath, organization_database: 'test', path: 'test' },
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(csvContent);
      (csv2geojson as jest.Mock).mockResolvedValue(geoJson);
      jest.spyOn(parserData, 'deleteFile').mockImplementation();
      jest
        .spyOn(AbstractHandler.prototype, 'handle')
        .mockResolvedValue({ ...input, geojson: geoJson });

      const result = await parserData.handle(input);

      expect(fs.readFileSync).toHaveBeenCalledWith(fileDownloadedPath, 'utf8');
      expect(csv2geojson).toHaveBeenCalledWith(csvContent, false);
      expect(parserData.deleteFile).toHaveBeenCalledWith(fileDownloadedPath);
      expect(result).toEqual({ ...input, geojson: geoJson });
    });
  });
});
