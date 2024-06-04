import { DeforestationKpisService, NaturalForestLostService, OtherKpisService } from '../files';
import { Injectable, Logger } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as asyncPool from 'tiny-async-pool';
import { getAllFilesAndZip } from '../shared/file.utils';

import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { IFileGenerator } from './i.file.generator';
import { POOL_SIZE } from '../shared/constants';

@Injectable()
export class AfiGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AfiGeneratorService.name);

  constructor(
    private readonly analysisAfiDataService: AnalysisAfiDataService,
    private readonly deforestationKpisService: DeforestationKpisService,
    private readonly naturalForestLostService: NaturalForestLostService,
    private readonly otherKpisService: OtherKpisService
  ) {
    super();
  }

  public async makeFile(filters: BasicFieldsFileRequest) {
    await this.deforestationKpisService.startEmail(filters);
    await this.runAfiFileGeneration(filters);
    await this.runAfiFileGeneration(filters, 1, 'aggregated');
    await getAllFilesAndZip(filters);
    await this.deforestationKpisService.finishProcess(filters);
  }

  private async runAfiFileGeneration(
    filters: BasicFieldsFileRequest,
    isListLevel = 0,
    suffix = ''
  ) {
    const numberOfPages = await this.analysisAfiDataService.getNumberOfPages(filters, isListLevel);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    await this.deforestationKpisService.start(filters, suffix);
    await this.naturalForestLostService.start(filters, suffix);
    await this.otherKpisService.start(filters, suffix);

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, page: i };
      const analysisData = await this.analysisAfiDataService.getDataPaginated(
        newFilter,
        isListLevel
      );
      this.deforestationKpisService.process(analysisData);
      this.naturalForestLostService.process(analysisData);
      this.otherKpisService.process(analysisData);
      return i;
    };

    for await (const localPage of asyncPool(POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await this.deforestationKpisService.finish(filters);
    await this.naturalForestLostService.finish(filters);
    await this.otherKpisService.finish(filters);
  }
}
