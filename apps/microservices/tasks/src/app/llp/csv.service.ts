import { Logger, Injectable } from '@nestjs/common';

import { Parser } from 'json2csv';
import * as asyncPool from "tiny-async-pool";
import * as fs from 'fs';

import {
  GenerationFileRequest,
  UspGetPaginatedAnalysisDataForUserList,
  UspGetListNameSchema,
  UspGetAnalysisDataCountForUserList
} from '@wri-monorepos/sql';
import { resultColumns, columnsListName, columnsTemplateId } from './constants'

@Injectable()
export class CSVService {

  private readonly logger = new Logger(CSVService.name);

  constructor(
    private uspGetPaginatedAnalysisDataForUserList: UspGetPaginatedAnalysisDataForUserList,
    private uspGetAnalysisDataCountForUserList: UspGetAnalysisDataCountForUserList,
    private uspGetListNameSchema: UspGetListNameSchema
  ){}

  buildCSVHeader(fields: any, filters: GenerationFileRequest){
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

  async getAnalysisData(organizationDatabase: string, filters: GenerationFileRequest) {
    const { page } = filters;
    let analysisData = await this.uspGetPaginatedAnalysisDataForUserList.run(organizationDatabase, filters);

    const [firstElem] = analysisData;
    const fields =
      columnsTemplateId[firstElem.template_id] ?? columnsListName[firstElem.list_name] ?? columnsTemplateId[14];

    let allFields = [...fields, ...filters.combinedColumnsSplited];

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
    const fieldsHeader = this.buildCSVHeader(fields, filters);
    const parser = new Parser({ fields: fieldsHeader, header });
    const csv = parser.parse(analysisData);
    return csv;
  };


  async generate(filter: GenerationFileRequest){

    const { organizationDatabase, key } = filter;

    const listSchema = await this.uspGetListNameSchema.run(organizationDatabase, filter);

    filter.listName = listSchema.list_name;
    filter.rowsPerPage = 5000;

    const numberOfPages  = await this.uspGetAnalysisDataCountForUserList.run(organizationDatabase, filter);
    this.logger.log(`Number of pages: ${numberOfPages}`);
    let arrayOfPages = Array.from(Array(numberOfPages - 1).keys());
    arrayOfPages = arrayOfPages.map((value) => value + 1);

    let newfilters = { ...filter, page: 0 };
    let analysisData = await this.getAnalysisData(organizationDatabase, newfilters);
    fs.writeFileSync(`/tmp/${key}.csv`, analysisData);

    const composeResults = async (i: number) => {
      newfilters = { ...filter, page: i };
      analysisData = await this.getAnalysisData(organizationDatabase, newfilters);
      fs.appendFileSync(`/tmp/${key}.csv`, analysisData);
      return i;
    };

    // eslint-disable-next-line no-unused-vars
    for await (const localPage of asyncPool(10, arrayOfPages, composeResults)) {
      this.logger.log(`Get page of number ${localPage} from database`);
    }
  }
}
