import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as asyncPool from 'tiny-async-pool';
import { EntitySchema } from 'typeorm';

import {
  ListFieldsFileRequest,
  UspGetListAnalysis,
  ListSchemaType,
  ListSchema,
} from '@wri-monorepos/sql';
import { InputService } from '../files/input.service';
import { GeometryService } from '../files/geometry.service';
import { DashboardService } from './dashboard.service';
import { IPipeService } from './i.pipe.service';

import { AnalysisDataService } from '../data/analysis.data.service';
import { IFileGenerator } from './i.file.generator';
import { POOL_SIZE } from '../shared/constants';
import { ServerConfigType } from '../../validators/server-config';

@Injectable()
export class ListGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(ListGeneratorService.name);

  constructor(
    private readonly inputService: InputService,
    private readonly geometryService: GeometryService,
    private readonly dashboardService: DashboardService,
    private readonly uspGetListAnalysis: UspGetListAnalysis,
    private readonly analysisDataService: AnalysisDataService,
    private readonly configService: ConfigService<ServerConfigType, true>
  ) {
    super();
  }

  public async makeFile(filters: ListFieldsFileRequest) {
    const { organizationDatabase, listId, combinedColumns, selectedLocations, file, isGFWList } =
      filters;
    const dbName = isGFWList
      ? this.configService.get('MSSQL_DATABASE', { infer: true })
      : organizationDatabase;

    const numberOfPages = await this.analysisDataService.getNumberOfPages(filters);
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    let arrayOfPages = Array.from(Array(numberOfPages).keys());
    arrayOfPages = arrayOfPages.map((value) => value + 1);

    // Add any additional columns the user selected
    const notAllowedValues = ['', undefined, 'all'];
    const combinedColumnsSplitted = notAllowedValues.includes(combinedColumns)
      ? []
      : combinedColumns.split(',');
    const fields = await this.getListOfFields(filters);

    // Include extra columns when filtering by location
    const selectedLocationsList = notAllowedValues.includes(selectedLocations)
      ? []
      : selectedLocations.split(',').map((x) => parseInt(x, 10));

    const [listLevelAnalysis] = await this.uspGetListAnalysis.run(dbName, {
      listId: listId,
    });

    filters = {
      ...filters,
      numberOfPages,
      combinedColumnsSplitted,
      selectedLocationsList,
      listLevelAnalysis,
      // has to add the following parameter to bring the geometry from the database, use for shapefile and geojson
      geometry: file === 'shapefile' || file === 'geojson' ? 1 : 0,
      fields,
    };

    const service = this.defineService(filters);

    await service.start(filters);

    const composeResults = async (i: number) => {
      const newFilters = { ...filters, page: i };
      const analysisData = await this.analysisDataService.getDataPaginated(newFilters);

      await service.process(analysisData, newFilters);
      return i;
    };

    for await (const localPage of asyncPool(POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await service.finish(filters);
  }

  private defineService(filters: ListFieldsFileRequest): IPipeService {
    const { type, file } = filters;

    const mapFileType2Service = {
      input_csv: this.inputService,
      input_shapefile: this.geometryService,
      input_geojson: this.geometryService,
    };

    return mapFileType2Service[`${type}_${file}`] ?? this.dashboardService;
  }

  private async getListOfFields(filters: ListFieldsFileRequest) {
    const newFilters = {
      ...filters,
      page: 1,
      rowsPerPage: 1,
    };

    const analysisData = await this.analysisDataService.getDataPaginated(newFilters);
    const [firstAnalysisDataRow] = analysisData;

    let attributesFields;

    try {
      const parsedAttrs = JSON.parse(firstAnalysisDataRow.attributes || '{}');
      attributesFields = Object.keys(parsedAttrs);
    } catch (e) {
      console.error(
        'Invalid JSON in firstAnalysisDataRow.attributes:',
        firstAnalysisDataRow?.attributes
      );
      attributesFields = [];
    }

    return this.getListLocationsStructure(attributesFields);
  }

  getListLocationsStructure(attributesList: string[]): string[] {
    const fieldsToExclude = new Set(['attributes', 'ErrorDetails', 'location_id']);

    const { options } = new EntitySchema<ListSchemaType>({
      ...ListSchema,
    });

    const entityFields = Object.values(options.columns)
      .map((col) => col.name)
      .filter((columnName) => !fieldsToExclude.has(columnName));

    return entityFields.concat(attributesList ?? []);
  }
}
