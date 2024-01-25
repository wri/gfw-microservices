import { AfiFileService } from '../files/afi.file.service';
import { Injectable, Logger } from '@nestjs/common';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as asyncPool from 'tiny-async-pool';
import { getAllFilesAndZip } from '../shared/file.utils';

import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { IFileGenerator } from './i.file.generator';

@Injectable()
export class AfiGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AfiGeneratorService.name);

  constructor(
    private readonly afiFileService: AfiFileService,
    private readonly analysisAfiDataService: AnalysisAfiDataService
  ) {
    super();
  }

  public async makeFile(filters: BasicFieldsFileRequest) {
    await this.runAfiFileGeneration(filters);
    await this.runAfiFileGeneration(filters, 1, 'deforestation_kpis_aggregated');
    await getAllFilesAndZip(filters);
    await this.afiFileService.finishProcess(filters);
  }

  private async runAfiFileGeneration(
    filters: BasicFieldsFileRequest,
    isListLevel = 0,
    suffix = 'deforestation_kpis'
  ) {
    const numberOfPages = await this.analysisAfiDataService.getNumberOfPages(filters, isListLevel);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    await this.afiFileService.start(filters, suffix);

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, pageNumber: i };
      const analysisData = await this.analysisAfiDataService.getDataPaginated(
        newFilter,
        isListLevel
      );
      this.afiFileService.process(analysisData);
      return i;
    };

    for await (const localPage of asyncPool(this.POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await this.afiFileService.finish(filters);
  }
}
