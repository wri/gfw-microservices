import { Logger } from '@nestjs/common';
import { csv2geojson } from './csv2geojson.parser';
import * as XLSX from 'xlsx';

export const xls2geojson = (xlsContent: Buffer) => {
  const logger = new Logger('XLS2GeoJSONParser');

  try {
    // Read the workbook from the buffer
    const workbook = XLSX.read(xlsContent, { type: 'buffer' });

    // Ensure there is at least one sheet
    if (workbook.SheetNames.length === 0) {
      throw new Error('The workbook contains no sheets.');
    }

    // Get the first sheet name and worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert the worksheet to CSV format
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: ',' });

    // Convert CSV to GeoJSON using the provided options
    return csv2geojson(csvOutput);
  } catch (error) {
    logger.error('Error converting XLS to GeoJSON:', error);
    throw error; // Re-throw the error after logging
  }
};
