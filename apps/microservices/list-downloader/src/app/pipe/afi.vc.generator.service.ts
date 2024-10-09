import { DeforestationKpisService, NaturalForestLossService, OtherKpisService } from '../files';
import { Injectable, Logger } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as asyncPool from 'tiny-async-pool';
import { getAllFilesAndZip } from '../shared/file.utils';

import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { IFileGenerator } from './i.file.generator';
import { POOL_SIZE } from '../shared/constants';

@Injectable()
export class AfiVcGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AfiVcGeneratorService.name);

  constructor(
    private readonly analysisAfiDataService: AnalysisAfiDataService,
    private readonly deforestationKpisService: DeforestationKpisService,
    private readonly naturalForestLostService: NaturalForestLossService,
    private readonly otherKpisService: OtherKpisService
  ) {
    super();
  }

  public async makeFile(filters: BasicFieldsFileRequest) {
    await this.deforestationKpisService.startEmail(filters);
    await this.runAfiFileGeneration(filters, 'location');
    await this.runAfiFileGeneration(filters, 'list');
    await getAllFilesAndZip(filters);
    await this.deforestationKpisService.finishProcess(filters);
  }

  private async runAfiFileGeneration(
    filters: BasicFieldsFileRequest,
    suffix: 'location' | 'list' = 'location'
  ) {
    const isListLevel = suffix === 'list' ? 1 : 0;
    const numberOfPages = await this.analysisAfiDataService.getNumberOfPages(filters, isListLevel);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    this.deforestationKpisService.start(filters, suffix);
    this.naturalForestLostService.start(filters, suffix);
    this.otherKpisService.start(filters, suffix);

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
