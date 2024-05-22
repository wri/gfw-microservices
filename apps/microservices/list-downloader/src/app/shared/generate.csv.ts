import * as fs from 'fs';

import { ListFieldsFileRequest } from '@wri-monorepos/sql';

const generateCSV = (
  filters: ListFieldsFileRequest,
  table: string,
  fileSuffix: string,
  mountCsv: (
    table: string,
    list_name: string,
    listLevelAnalysis,
    isAggregated?: boolean
  ) => Array<Array<string>>,
  isAggregate = true
) => {
  if (filters.selectedLocationsList.length != 1) {
    const { key, listName, listLevelAnalysis } = filters;
    const csvData = mountCsv(table, listName, listLevelAnalysis, isAggregate);
    const csvString = csvData.map((row) => row.join(',')).join('\n');
    fs.writeFileSync(`/tmp/wri-${key}/${listName}_${fileSuffix}.csv`, `${csvString}\n`);
  }
};

export { generateCSV };
