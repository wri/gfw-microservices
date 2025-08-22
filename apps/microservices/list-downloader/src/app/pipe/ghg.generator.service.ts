import { Injectable, Logger } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as asyncPool from 'tiny-async-pool';
import { getAllFilesAndZip } from '../shared/file.utils';

import { IFileGenerator } from './i.file.generator';
import { POOL_SIZE } from '../shared/constants';
import { GreenHouseGasEmissionsService } from '../files/greenhouse.gas.emissions.service';
import { AnalysisGhgDataService } from '../data/analysis.ghg.data.service';
import { GhgRawEmissions } from '../files/ghg.raw.emissions.service';

@Injectable()
export class GreenHouseGasEmissionsGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(GreenHouseGasEmissionsGeneratorService.name);

  constructor(
    private readonly analysisGhgDataService: AnalysisGhgDataService,
    private readonly greenHouseGasEmissionsService: GreenHouseGasEmissionsService,
    private readonly GhgRawEmissionsService: GhgRawEmissions
  ) {
    super();
  }

  public async makeFile(filters: BasicFieldsFileRequest) {
    await this.greenHouseGasEmissionsService.startEmail(filters);
    await this.runGhgFileGeneration(filters, 'location');
    await getAllFilesAndZip(filters);
    await this.greenHouseGasEmissionsService.finishProcess(filters);
  }

  private async runGhgFileGeneration(
    filters: BasicFieldsFileRequest,
    suffix: 'location' | 'list' = 'location'
  ) {
    const isListLevel = suffix === 'list' ? 1 : 0;
    const numberOfPages = await this.analysisGhgDataService.getNumberOfPages(filters, isListLevel);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    this.greenHouseGasEmissionsService.start(filters);
    this.GhgRawEmissionsService.start(filters);

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, page: i };
      const analysisData = await this.analysisGhgDataService.getDataPaginated(
        newFilter,
        isListLevel
      );
      this.greenHouseGasEmissionsService.process(analysisData);
      this.GhgRawEmissionsService.process(analysisData);
      return i;
    };

    for await (const localPage of asyncPool(POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await this.greenHouseGasEmissionsService.finish(filters);
    await this.GhgRawEmissionsService.finish(filters);
  }
}
