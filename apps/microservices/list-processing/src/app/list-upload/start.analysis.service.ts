import { Injectable, Logger } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { S3Service } from '@wri-monorepos/aws';
import { AbstractHandler, ChainType } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { GADMService } from './chain/gadm.service';
import { InsertLocationData } from './chain/insert.location.data';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';
import { StartAnalysis } from './chain/start.analysis';
import { SQLUtils } from '@wri-monorepos/sql';
import { logExecutionTime } from './chain/shared';
import { WriteLocationCount } from './chain/write.location.count';
import { ProcessUploadData } from './chain/process.upload.data';

import fastq from 'fastq';
import type { queue, done } from 'fastq';

type WorkerType = {
  request: RequestLargeListProcess;
  config: ConfigService<ServerConfigType, true>;
};

async function worker(input: WorkerType, cb: done) {
  const { organization_database: organizationDatabase } = input.request;

  const chainType: ChainType = {
    request: input.request,
    geojson: {
      type: 'FeatureCollection',
      features: [],
    },
  };

  const connection = new SQLUtils();
  const s3Service = new S3Service();
  await connection.connect(organizationDatabase);

  const downloadS3File = new DownloadS3File(s3Service, input.config);
  const parseData = new ParserData();
  const processUploadData = new ProcessUploadData();
  const gadmService = new GADMService();
  const validateLatLongGeojson = new ValidateLatLongGeojson();
  const insertLocationData = new InsertLocationData();
  const writeLocationCount = new WriteLocationCount();
  const startAnalysis = new StartAnalysis();

  downloadS3File
    .setNext(parseData)
    .setNext(processUploadData)
    .setNext(gadmService) // depends on convertPoint2Polygon
    .setNext(validateLatLongGeojson) // depends on gadmService
    .setNext(insertLocationData)
    .setNext(writeLocationCount)
    .setNext(startAnalysis);

  await AbstractHandler.runFullChain(downloadS3File, chainType);
  await connection.disconnect();
  cb(null);
}

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(private readonly config: ConfigService<ServerConfigType, true>) {}

  @logExecutionTime(StartAnalysisService.name)
  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    const q: queue<WorkerType> = fastq(worker, 2);

    q.push({
      request,
      config: this.config,
    });

    return {
      executionArn: '',
      startDate: new Date().toISOString(),
    };
  }
}
