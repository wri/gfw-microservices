import { Logger, Injectable } from '@nestjs/common';

import * as asyncPool from 'tiny-async-pool';

import { ListFieldsFileRequest, UspGetListAnalysis } from '@wri-monorepos/sql';

import { InputService } from '../files/input.service';
import { ResultService } from '../files/result.service';
import { ShapefileService } from '../files/shapefile.service';
import { DashboardService } from './dashboard.service';
import { IPipeService } from './i.pipe.service';

import { AnalysisDataService } from '../data/analysis.data.service';
import { IFileGenerator } from './i.file.generator';
import { POOL_SIZE } from '../shared/constants';

@Injectable()
export class ListGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(ListGeneratorService.name);

  constructor(
    private readonly inputService: InputService,
    private readonly shapefileService: ShapefileService,
    private readonly dashboardService: DashboardService,
    private readonly resultService: ResultService,
    private readonly uspGetListAnalysis: UspGetListAnalysis,
    private readonly analysisDataService: AnalysisDataService
  ) {
    super();
  }

  public async makeFile(filters: ListFieldsFileRequest) {
    const { organizationDatabase, listId, combinedColumns, selectedLocations, file } = filters;

    const numberOfPages = await this.analysisDataService.getNumberOfPages(filters);
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

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
      listId: listId,
    });

    filters = {
      ...filters,
      numberOfPages,
      combinedColumnsSplitted,
      selectedLocationsList,
      listLevelAnalysis,
      // has to add the following parameter to bring the geometry from the database, use only for shapefile
      geometry: file === 'shapefile' ? 1 : 0,
      ...fields,
    };

    const service = this.defineService(filters);

    await service.start(filters);

    const composeResults = async (i: number) => {
      const newFilters = { ...filters, page: i };

      const analysisData = await this.analysisDataService.getDataPaginated(newFilters);

      service.process(analysisData, newFilters);
      return i;
    };

    for await (const localPage of asyncPool(POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    service.finish(filters);
  }

  private defineService(filters: ListFieldsFileRequest): IPipeService {
    const { type, file } = filters;

    const mapFileType2Service = {
      input_csv: this.inputService,
      input_shapefile: this.shapefileService,
      results_csv: this.resultService,
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
    const [element] = analysisData;

    return {
      fields: Object.keys(element ?? {}),
      templateId: element?.template_id,
    };
  }
}
