import {Logger} from "@nestjs/common";
import {GenerationFileRequest} from "@wri-monorepos/sql";

import axios from 'axios';
import * as axiosRetry from 'axios-retry';


export abstract class IInputData {

  private readonly loggerPipe = new Logger(IInputData.name);

  constructor() {
    axiosRetry(axios, {
      retries: 3, // number of retries
      retryDelay: (retryCount) => {
        this.loggerPipe.log(`retry attempt: ${retryCount}`);
        return retryCount * 2000; // time interval between retries
      },
    });
  }

  abstract getNumberOfPages(filters: GenerationFileRequest, isListLevel: number) : Promise<number>;
  abstract getDataPaginated(filters: GenerationFileRequest, isListLevel: number): Promise<unknown>;
}

