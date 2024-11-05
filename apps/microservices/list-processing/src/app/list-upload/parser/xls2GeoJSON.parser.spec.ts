import { Logger } from '@nestjs/common';
import { xls2geojson } from './xls2GeoJSON.parser';
import * as XLSX from 'xlsx';
import { csv2geojson } from './csv2geojson.parser';

jest.mock('xlsx');
jest.mock('./csv2geojson.parser');

describe('xls2geojson', () => {
  let loggerErrorSpy;

  beforeEach(() => {
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('should convert XLS content to GeoJSON', () => {
    const mockBuffer = Buffer.from('mock xls content');
    const mockCsvOutput = 'mock csv content';
    const mockGeoJsonOutput = { type: 'FeatureCollection', features: [] };

    // Type assertion to jest.Mock
    (XLSX.read as jest.Mock).mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    });

    (XLSX.utils.sheet_to_csv as jest.Mock).mockReturnValue(mockCsvOutput);
    (csv2geojson as jest.Mock).mockReturnValue(mockGeoJsonOutput);

    const result = xls2geojson(mockBuffer);

    expect(result).toEqual(mockGeoJsonOutput);
    expect(XLSX.read).toHaveBeenCalledWith(mockBuffer, { type: 'buffer' });
    expect(XLSX.utils.sheet_to_csv).toHaveBeenCalledWith({}, { FS: ',' });
    expect(csv2geojson).toHaveBeenCalledWith(mockCsvOutput);
  });

  it('should log an error if the workbook contains no sheets', () => {
    const mockBuffer = Buffer.from('mock xls content');

    (XLSX.read as jest.Mock).mockReturnValue({
      SheetNames: [],
      Sheets: {},
    });

    expect(() => xls2geojson(mockBuffer)).toThrow('The workbook contains no sheets.');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error converting XLS to GeoJSON:',
      expect.any(Error)
    );
  });
});
