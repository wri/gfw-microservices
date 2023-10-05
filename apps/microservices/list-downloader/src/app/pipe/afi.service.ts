import { AfiFileService } from './../files/afi.file.service';
import { Logger, Injectable } from '@nestjs/common';
import { GenerationFileRequest, AfiAnalysisByListId } from '@wri-monorepos/sql';
import * as asyncPool from 'tiny-async-pool';
import { getAllFilesAndZip } from '../shared/file.utils';

@Injectable()
export class AfiService {
  private POOL_SIZE = 5;

  private OPTIONS = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  private readonly logger = new Logger(AfiService.name);

  constructor(private readonly afiFileService: AfiFileService) {}

  public async makeFile(filters: GenerationFileRequest) {
    await this.runAfiFileGeneration(filters);
    await this.runAfiFileGeneration(filters, 1, 'afi_aggregated');
    await getAllFilesAndZip(filters);
    await this.afiFileService.uploadToS3(filters);
  }

  private async runAfiFileGeneration(
    filters: GenerationFileRequest,
    isListLevel = 0,
    suffix = 'afi'
  ) {
    const numberOfPages = await this.getNumberOfPages(filters, isListLevel);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    this.afiFileService.start(filters, suffix);

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, pageNumber: i };
      const analysisData = await this.getAnalysisData(newFilter, isListLevel);
      this.afiFileService.process(analysisData);
      return i;
    };

    for await (const localPage of asyncPool(this.POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await this.afiFileService.finish(filters);
  }

  private async getAnalysisData(filter, isListLevel = 0): Promise<AfiAnalysisByListId[]> {
    const { organizationDatabase, rowsPerPage, pageNumber, listId } = filter;
    const queryString = `rowsPerPage=${rowsPerPage}&pageNumber=${pageNumber}&clientDatabase=${organizationDatabase}&isListLevel=${isListLevel}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/afi/${listId}/data-per-page?${queryString}`;
    console.log(url);
    const response = await fetch(encodeURI(url), this.OPTIONS);
    const analysisData = (await response.json()) as AfiAnalysisByListId[];
    return analysisData;
  }

  private async getNumberOfPages(filters: GenerationFileRequest, isListLevel = 0): Promise<number> {
    const { organizationDatabase, listId, rowsPerPage } = filters;

    const queryString = `rowsPerPage=${rowsPerPage}&clientDatabase=${organizationDatabase}&isListLevel=${isListLevel}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/afi/${listId}/number-of-pages?${queryString}`;
    const response = await fetch(encodeURI(url), this.OPTIONS);
    const { pages } = (await response.json()) as { pages: number };
    return pages;
  }
}
