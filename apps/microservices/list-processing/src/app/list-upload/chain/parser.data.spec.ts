import { ParserData } from './parser.data';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { csv2geojson } from '../parser/csv2geojson.parser';
import { ChainType } from './types';

// Mock dependencies
jest.mock('fs');
jest.mock('../parser/csv2geojson.parser');

describe('ParserData', () => {
  let parserData: ParserData;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    parserData = new ParserData();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteFile', () => {
    it('should log an error if the file does not exist', (done) => {
      const fileDownloadedPath = 'path/to/nonexistent/file';
      (fs.access as unknown as jest.Mock).mockImplementation((path, mode, callback) => {
        callback(new Error('File does not exist'));
      });

      const loggerErrorSpy = jest.spyOn(logger, 'error');

      parserData.deleteFile(fileDownloadedPath);

      // Wait for the asynchronous operation to complete
      // eslint-disable-next-line no-undef
      setImmediate(() => {
        expect(loggerErrorSpy).toHaveBeenCalledWith(`${fileDownloadedPath} does not exist.`);
        done();
      });
    });
  });
});
