import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { AbstractHandler, ChainType } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { GADMService } from './chain/gadm.service';
import { ClipToLandService } from './chain/clipToLand.service';
import { InsertLocationData } from './chain/insert.location.data';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';
import { StartAnalysis } from './chain/start.analysis';
import { SQLUtils, upgradeListSchema } from '@wri-monorepos/sql';
import { logExecutionTime } from './chain/shared';
import { WriteLocationCount } from './chain/write.location.count';
import { ProcessUploadData } from './chain/process.upload.data';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';

import fastq from 'fastq';
import type { queue, done } from 'fastq';
import { ListSchemaName } from './chain/list.schema.name';
import { ConvertPoint2Polygon } from './chain/convert.point.2.polygon';
import { ValidateMandatoryFields } from './chain/validate.mandatory.fields';
import { ValidateLocationName } from './chain/validate.location.name';
import { AddNewLocationToAnalysisTable } from './chain/add.new.location.to.analysis.table';
import { ConvertGeojsonProperties } from './chain/convert.geojson.properties';
import { PutListAsDraft } from './chain/put.list.as.draft';
import { GenerateErrorFile } from './chain/generate.error.file';
import { AdjustGeoData } from './chain/adjust.geo.data';
import { CommodityService } from '../list/commodity.service';

type WorkerType = {
  request: RequestLargeListProcess;
  config: ConfigService<ServerConfigType, true>;
  emailService: EmailService;
};

const LIST_UPLOAD_QUEUE_CONCURRENCY = 5;

export async function clearErrorFile(organizationDatabase: string, listId: number) {
  const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
  const listRepository = connection.getRepository(Lists);
  await listRepository.update({ id: listId }, { errorFileStoragePath: null });
}

async function worker(input: WorkerType, cb: done) {
  const { organization_database: organizationDatabase, list_id: listId } = input.request;

  // Clear any existing error file before starting analysis
  await clearErrorFile(organizationDatabase, listId);

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
  const clipToLandService = new ClipToLandService();
  const validateLatLongGeojson = new ValidateLatLongGeojson();
  const insertLocationData = new InsertLocationData();
  const writeLocationCount = new WriteLocationCount();
  const listSchemaName = new ListSchemaName(false);
  const startAnalysis = new StartAnalysis();
  const convertPoint2Polygon = new ConvertPoint2Polygon();
  const validateMandatoryFields = new ValidateMandatoryFields();
  const validateLocationName = new ValidateLocationName();
  const addNewLocationToAnalysisTable = new AddNewLocationToAnalysisTable();
  const convertGeojsonProperties = new ConvertGeojsonProperties();
  const putListAsDraft = new PutListAsDraft(input.config, input.emailService);
  const generateErrorFile = new GenerateErrorFile(s3Service, input.config);
  const adjustGeoData = new AdjustGeoData();

  downloadS3File
    .setNext(parseData)
    .setNext(convertGeojsonProperties)
    .setNext(listSchemaName)
    .setNext(adjustGeoData)
    .setNext(validateMandatoryFields) // depends on centroid calculation in adjustGeoData
    .setNext(validateLocationName)
    .setNext(convertPoint2Polygon)
    .setNext(gadmService) // depends on convertPoint2Polygon
    .setNext(validateLatLongGeojson) // depends on gadmService, must be before clipToLandService
    .setNext(clipToLandService)
    .setNext(processUploadData)
    .setNext(putListAsDraft) // depends on gadmService and validateLatLongGeojson
    .setNext(insertLocationData)
    .setNext(writeLocationCount)
    .setNext(generateErrorFile)
    .setNext(addNewLocationToAnalysisTable)
    .setNext(startAnalysis);

  await AbstractHandler.runFullChain(downloadS3File, chainType);
  await connection.disconnect();
  cb(null);
}

@Injectable()
export class StartAnalysisService {
  private intervals: NodeJS.Timeout[] = [];
  private readonly logger = new Logger(StartAnalysisService.name);
  private queue: queue<WorkerType> = fastq(worker, LIST_UPLOAD_QUEUE_CONCURRENCY);

  constructor(
    private readonly config: ConfigService<ServerConfigType, true>,
    @Inject(forwardRef(() => CommodityService))
    private readonly commodityService: CommodityService,
    private readonly emailService: EmailService
  ) {
    const intervalId = global.setInterval(() => {
      const stats = this.getQueueStats();
      if (stats.running > 0 || stats.length > 0) {
        this.logger.log(`Queue Health: ${JSON.stringify(stats)}`);
      }
    }, 30000); // Log every 30 seconds if there's activity
    this.intervals.push(intervalId);
  }

  @logExecutionTime(StartAnalysisService.name)
  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    const {
      list_id: listId,
      commodity,
      organization_database: clientDatabase,
      user_id: userId,
    } = request;
    if (listId) {
      const listExistAtClientStore =
        await this.commodityService.checkIfListExistAndCommodityIsTheSame(
          listId,
          commodity,
          clientDatabase
        );
      if (!listExistAtClientStore) {
        this.logger.warn(`List not found with id ${listId} at client store`);
        throw new Error(`List not found with id ${listId} at client store`);
      } else {
        this.logger.log(`List ${listId} found at client store`);
        // Upgrade the list schema to the latest version
        await upgradeListSchema({
          clientDb: clientDatabase,
          listId: listId,
          userId: userId,
        });
      }
    }

    this.queue.push({
      request,
      config: this.config,
      emailService: this.emailService,
    });

    return {
      executionArn: '',
      startDate: new Date().toISOString(),
    };
  }

  onModuleDestroy() {
    // Clean up all intervals when module is destroyed
    this.intervals.forEach((intervalId) => global.clearInterval(intervalId));
  }

  getQueueStats() {
    return {
      length: this.queue.length(),
      running: this.queue.running(),
      concurrency: this.queue.concurrency,
    };
  }
}
