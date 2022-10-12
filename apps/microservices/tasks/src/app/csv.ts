/* eslint-disable no-restricted-syntax */
 
import { Parser } from 'json2csv';
import * as asyncPool from "tiny-async-pool";
import * as fs from 'fs';

import { getNumberPagesForAnalysisDataUserList, getPaginatedAnalysisDataForUserList, getListNameSchema, Filters  } from '@wri-monorepos/sql';
import { logger } from '@wri-monorepos/util';

import { resultColumns, columnsListName, columnsTemplateId } from './constants';

const buildCSVHeader = (fields: any, filters: Filters) => {
  const originalFields = fields.reduce((obj, str) => {
    const newObj = [...obj];
    newObj.push({
      label: str,
      value: str,
    });
    return newObj;
  }, []);

  const combinedFields = filters.combinedColumnsSplited.reduce((obj, str) => {
    const newObj = [...obj];
    newObj.push({
      label: str,
      value: str,
    });
    return newObj;
  }, []);

  let resultColumnsList = [];
  if (filters.type === 'result') {
    resultColumnsList = Object.entries(resultColumns).reduce((obj, array) => {
      const [value, label] = array;
      const newObj = [...obj];
      newObj.push({
        label,
        value,
      });
      return newObj;
    }, []);
  }

  return resultColumnsList.concat(combinedFields).concat(originalFields);
};

const getAnalysisData = async (organizationDatabase: string, filters: Filters) => {
  const { page } = filters;
  let analysisData =  await getPaginatedAnalysisDataForUserList(organizationDatabase, filters);
  const [ firstElem ] = analysisData;
  const fields =
    columnsTemplateId[firstElem.template_id] ?? columnsListName[firstElem.list_name] ?? columnsTemplateId[14];

  let allFields = [...fields, ...filters.combinedColumns];

  if (filters.type === 'result') {
    allFields = [...allFields, ...Object.keys(resultColumns)];
  }

  analysisData = analysisData.map((data) =>
    Object.keys(data)
      .filter((key) => allFields.includes(key))
      .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: data[key],
        });
      }, {})
  );

  const header = page === 0;
  const fieldsHeader = buildCSVHeader(fields, filters);
  const parser = new Parser({ fields: fieldsHeader, header });
  const csv = parser.parse(analysisData);
  return csv;
};

export const build = async (key: string, organizationDatabase: string, filter: Filters) => {

  const listSchema = await getListNameSchema(organizationDatabase, filter);
  filter.listName = listSchema.list_name;

  filter.rowsPerPage = 5000;
  const { numberOfPages } = await getNumberPagesForAnalysisDataUserList(organizationDatabase, filter);
  logger.info(`Number of pages: ${numberOfPages}`);
  let arrayOfPages = Array.from(Array(numberOfPages - 1).keys());
  arrayOfPages = arrayOfPages.map((value) => value + 1);

  let newfilters = { ...filter, page: 0 };
  let analysisData = await getAnalysisData(organizationDatabase, newfilters);
  fs.writeFileSync(`/tmp/${key}.csv`, analysisData);

  const composeResults = async (i: number) => {
    newfilters = { ...filter, page: i };
    analysisData = await getAnalysisData(organizationDatabase, newfilters);
    fs.appendFileSync(`/tmp/${key}.csv`, analysisData);
    return i;
  };

  // eslint-disable-next-line no-unused-vars
  for await (const localPage of asyncPool(15, arrayOfPages, composeResults)) {
    logger.info(`Get page of number ${localPage} from database`);
  }
};
