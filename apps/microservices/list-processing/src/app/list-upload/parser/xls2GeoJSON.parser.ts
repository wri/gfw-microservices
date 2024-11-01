import { csv2geojson } from './csv2geojson.parser';
import * as XLSX from 'xlsx';

export interface XLSParseOptions {
  latfield?: string;
  lonfield?: string;
  numericFields?: string;
  includeLatLon?: boolean;
}

export const xls2geojson = (xlsContent: Buffer) => {
  const workbook = XLSX.read(xlsContent, { type: 'buffer' });

  // Get the name of the first sheet
  const firstSheetName = workbook.SheetNames[0];

  // Get the first sheet
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert the worksheet to CSV format
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: ',' });

  return csv2geojson(csvOutput);
};
