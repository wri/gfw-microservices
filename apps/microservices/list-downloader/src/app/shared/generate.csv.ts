import * as fs from 'fs';

import { GenerationFileRequest } from '@wri-monorepos/sql';

const generateCSV = (
  filters: GenerationFileRequest,
  table: string,
  fileSuffix: string,
  mountCsv: (
    table: string,
    list_name: string,
    listLevelAnalysis: any
  ) => Array<Array<string>>
) => {
  if (filters.selectedLocationsList.length != 1) {
    const { key, listName, listLevelAnalysis } = filters;
    const csvData = mountCsv(table, listName, listLevelAnalysis);
    const csvString = csvData.map((row) => row.join(',')).join('\n');
    fs.writeFileSync(`/tmp/${key}_${fileSuffix}.csv`, `${csvString}\n`);
  }
};

export { generateCSV };
