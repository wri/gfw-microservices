import { Logger, Injectable } from '@nestjs/common';

import * as asyncPool from 'tiny-async-pool';
import * as sql from 'mssql';

import {
  SQLUtils,
  ListNameSchema,
  GenerationFileRequest,
  UspGetListAnalysis,
  AnalysisDataCountReturnType,
  AnalysisDataType,
} from '@wri-monorepos/sql';

import { InputService } from '../files/input.service';
import { ResultService } from '../files/result.service';
import { ShapefileService } from '../files/shapefile.service';
import { DashboardService } from './dashboard.service';
import { IPipeService } from './IPipeService';
import fetch from 'node-fetch';

@Injectable()
export class PipeService {
  private MAX_NUMBER_OF_ROWS_PER_PAGE = 5000;
  private POOL_SIZE = 5;

  private OPTIONS = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  constructor(
    private inputService: InputService,
    private shapefileService: ShapefileService,
    private dashboardService: DashboardService,
    private resultService: ResultService,
    private uspGetListAnalysis: UspGetListAnalysis
  ) {}

  private readonly logger = new Logger(PipeService.name);

  public async makeFile(filters: GenerationFileRequest) {
    const { organizationDatabase, listID, combinedColumns, selectedLocations, file } = filters;

    this.logger.log(`(${listID}) - Receive request to build file for list`);

    filters = {
      ...filters,
      rowsPerPage: this.MAX_NUMBER_OF_ROWS_PER_PAGE,
    };

    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];
    const listSchema = await SQLUtils.queryDB<ListNameSchema>(
      organizationDatabase,
      'uspGetListNameSchema',
      parameters
    );

    const numberOfPages = await this.getNumberOfPages(filters);
    this.logger.log(`(${listID}) - Number of pages: ${numberOfPages}`);

    let arrayOfPages = Array.from(Array(numberOfPages).keys());
    arrayOfPages = arrayOfPages.map((value) => value + 1);

    // extra columns selected by the user that he have to add
    const notAllowedValues = ['', undefined, 'all'];
    const combinedColumnsSplitted = notAllowedValues.includes(combinedColumns)
      ? []
      : combinedColumns.split(',');
    const fields = await this.getListOfFields(filters);

    // extra columns  considering that the user filter by location
    const selectedLocationsList = notAllowedValues.includes(selectedLocations)
      ? []
      : selectedLocations.split(',').map((x) => parseInt(x, 10));

    const [listLevelAnalysis] = await this.uspGetListAnalysis.run(organizationDatabase, {
      listId: listID,
    });

    filters = {
      ...filters,
      listName: listSchema.list_name,
      numberOfPages,
      combinedColumnsSplitted,
      selectedLocationsList,
      listLevelAnalysis,
      // has to add the following parameter to bring the geometry from the database, use only for shapefile
      geometry: file === 'shapefile' ? 1 : 0,
      ...fields,
    };

    const service = this.defineService(filters);

    service.start(filters);

    const composeResults = async (i: number) => {
      const newFilters = { ...filters, page: i };

      const analysisData = await this.getAnalysisData(newFilters);

      service.process(analysisData, newFilters);
      return i;
    };

    for await (const localPage of asyncPool(this.POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listID}) - Get page of number ${localPage} from database`);
    }

    service.finish(filters);
  }

  private defineService(filters: GenerationFileRequest): IPipeService {
    const { type, file } = filters;

    const mapFileType2Service = {
      input_csv: this.inputService,
      input_shapefile: this.shapefileService,
      results_csv: this.resultService,
    };

    return mapFileType2Service[`${type}_${file}`] ?? this.dashboardService;
  }

  private async getListOfFields(filters: GenerationFileRequest) {
    const newFilters = {
      ...filters,
      page: 1,
      rowsPerPage: 1,
    };

    const analysisData = await this.getAnalysisData(newFilters);
    const [element] = analysisData;

    return {
      fields: Object.keys(element),
      templateId: element.template_id,
    };
  }

  private async getAnalysisData(filter): Promise<AnalysisDataType[]> {
    const queryString = this.convertToQueryFields(filter);
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/paginated-list-data?${queryString}`;
    const response = await fetch(encodeURIComponent(url), this.OPTIONS);
    const analysisData = (await response.json()) as AnalysisDataType[];
    return analysisData;
  }

  private async getNumberOfPages(filters: GenerationFileRequest): Promise<number> {
    const queryString = this.convertToQueryFields(filters);
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/pages-paginated-list-data?${queryString}`;
    const response = await fetch(encodeURIComponent(url), this.OPTIONS);
    const { numberOfPages } = (await response.json()) as AnalysisDataCountReturnType;
    return numberOfPages;
  }

  private convertToQueryFields(filters: GenerationFileRequest): string {
    const fields = [
      'listID',
      'organizationDatabase',
      'analysisAreaMax',
      'analysisAreaMin',
      'country',
      'geometry',
      'orderType',
      'page',
      'rowsPerPage',
      'sortByAttribute',
      'state',
      'subState',
      'locationLogic',
      'locationIds',
      'locationStatement',
      'combinedColumns',
      'searchString',
    ];

    const res = fields.reduce((result, fieldName) => {
      const value = filters[fieldName];
      if (value != undefined || value != null) {
        result += `${fieldName}=${value}&`;
      }
      return result;
    }, '');

    const removeLastCharacter = res.substring(0, res.length - 1);
    return removeLastCharacter;
  }
}
