import { AfiGeometryService } from '../files';
import { Injectable, Logger } from '@nestjs/common';
import { ListFieldsFileRequest, UspGetListAnalysis } from '@wri-monorepos/sql';
import * as asyncPool from 'tiny-async-pool';

import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { IFileGenerator } from './i.file.generator';
import { POOL_SIZE } from '../shared/constants';
import { IPipeService } from './i.pipe.service';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { AnalysisDataService } from '../data';

@Injectable()
export class AfiVcGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AfiVcGeneratorService.name);

  constructor(
    private readonly analysisAfiDataService: AnalysisAfiDataService,
    private readonly afiGeometryService: AfiGeometryService,
    private readonly uspGetListAnalysis: UspGetListAnalysis,
    private readonly configService: ConfigService<ServerConfigType, true>,
    private readonly analysisDataService: AnalysisDataService
  ) {
    super();
  }

  public async makeFile(filters: ListFieldsFileRequest) {
    const { file, type } = filters;
    if (file !== 'shapefile' || type !== 'afiVC') {
      this.logger.error(`Service not found for type: ${type} and file: ${file}`);
      return;
    }
    const service = this.defineService(filters);
    await this.runAfiFileGeneration(filters);
    await service.finish(filters);
  }

  private async runAfiFileGeneration(
    filters: ListFieldsFileRequest,
    suffix: 'location' | 'list' = 'location'
  ) {
    const { organizationDatabase, listId, file, isGFWList, combinedColumns, selectedLocations } =
      filters;
    const notAllowedValues = ['', undefined, 'all'];
    const selectedLocationsList = notAllowedValues.includes(selectedLocations)
      ? []
      : selectedLocations.split(',').map((x) => parseInt(x, 10));
    const isListLevel = suffix === 'list' ? 1 : 0;

    const numberOfPages = await this.analysisAfiDataService.getNumberOfPages(filters, isListLevel);
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    const combinedColumnsSplitted = notAllowedValues.includes(combinedColumns)
      ? []
      : combinedColumns.split(',');
    const dbName = isGFWList
      ? this.configService.get('MSSQL_DATABASE', { infer: true })
      : organizationDatabase;
    const [listLevelAnalysis] = await this.uspGetListAnalysis.run(dbName, {
      listId: listId,
    });
    const fields = await this.getListOfFields(filters);

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

      await service.process(analysisData, newFilters);
      return i;
    };

    for await (const localPage of asyncPool(POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }
  }
  private defineService(filters: ListFieldsFileRequest): IPipeService {
    const { type, file } = filters;
    const mapFileType2Service = {
      afiVC_shapefile: this.afiGeometryService,
    };

    return mapFileType2Service[`${type}_${file}`];
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
    };
  }
}
