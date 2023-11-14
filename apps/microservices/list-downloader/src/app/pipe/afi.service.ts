import { AfiFileService } from './../files/afi.file.service';
import { Logger, Injectable } from '@nestjs/common';
import { GenerationFileRequest, AfiAnalysisByListId } from '@wri-monorepos/sql';
import * as asyncPool from 'tiny-async-pool';
import { getAllFilesAndZip } from '../shared/file.utils';

import axios from 'axios';
import * as axiosRetry from 'axios-retry';

@Injectable()
export class AfiService {
  private POOL_SIZE = 5;

  private readonly logger = new Logger(AfiService.name);

  constructor(private readonly afiFileService: AfiFileService) {
    axiosRetry(axios, {
      retries: 3, // number of retries
      retryDelay: (retryCount) => {
        this.logger.log(`retry attempt: ${retryCount}`);
        return retryCount * 2000; // time interval between retries
      },
    });
  }

  public async makeFile(filters: GenerationFileRequest) {
    await this.runAfiFileGeneration(filters);
    await this.runAfiFileGeneration(filters, 1, 'deforestation_kpis_aggregated');
    await getAllFilesAndZip(filters);
    await this.afiFileService.finishProcess(filters);
  }

  private async runAfiFileGeneration(
    filters: GenerationFileRequest,
    isListLevel = 0,
    suffix = 'deforestation_kpis'
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

    try {
      const { data } = await axios.get(encodeURI(url));
      return data as AfiAnalysisByListId[];
    } catch (error) {
      this.logger.error(`listId: ${listId} , pageNumber: ${pageNumber} error: ${error}`);
      return [];
    }
  }

  private async getNumberOfPages(filters: GenerationFileRequest, isListLevel = 0): Promise<number> {
    const { organizationDatabase, listId, rowsPerPage } = filters;

    const queryString = `rowsPerPage=${rowsPerPage}&clientDatabase=${organizationDatabase}&isListLevel=${isListLevel}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/afi/${listId}/number-of-pages?${queryString}`;
    try {
      const { data } = await axios.get(encodeURI(url));
      const response = data as { pages: number };
      return response.pages;
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return 0;
    }
  }
}
