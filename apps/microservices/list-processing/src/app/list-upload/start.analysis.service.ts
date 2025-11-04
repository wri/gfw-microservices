import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { AbstractHandler, ChainType, RequestNewList } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { GADMService } from './chain/gadm.service';
import { ClipToLandService } from './chain/clipToLand.service';
import { InsertLocationData } from './chain/insert.location.data';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';
import { StartAnalysis } from './chain/start.analysis';
import { SQLUtils, upgradeListSchema, ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { logExecutionTime } from './chain/shared';
import { WriteLocationCount } from './chain/write.location.count';
import { ProcessUploadData } from './chain/process.upload.data';

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
import { checkListSizeLimit } from '../common/check.listSizelimit';
import { MAX_LOCATIONS_PER_LIST } from '../common/constants';
import { ListSizeLimitException } from '../common/listSizeLimit.exception';
import { updateListsAnalysisStatus } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';

type WorkerType = {
  request: RequestLargeListProcess;
  config: ConfigService<ServerConfigType, true>;
  emailService: EmailService;
};

const LIST_UPLOAD_QUEUE_CONCURRENCY = 1;
const workerLogger = new Logger('ListUploadWorker');

export async function clearErrorFile(organizationDatabase: string, listId: number) {
  const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
  const listRepository = connection.getRepository(Lists);
  await listRepository.update({ id: listId }, { errorFileStoragePath: null });
}

/**
 * Updates ListsAnalysisStatus when a list size limit is exceeded
 * @param organizationDatabase - Database name
 * @param listId - List ID
 * @param analysisIds - Array of analysis IDs to update
 * @param errorMessage - The actual error message from the exception
 */
async function updateAnalysisStatusForSizeLimitError(
  organizationDatabase: string,
  listId: number,
  analysisIds: string[],
  errorMessage: string
): Promise<void> {
  if (!analysisIds || analysisIds.length === 0) {
    workerLogger.warn(
      `No analysis IDs provided for list ${listId}, cannot update ListsAnalysisStatus`
    );
    return;
  }

  try {
    await updateListsAnalysisStatus(organizationDatabase, {
      listId,
      errorInfo: errorMessage,
      status: listStatus.Inactive,
      analysisIds,
    });

    workerLogger.log(
      `Successfully updated ListsAnalysisStatus for list ${listId} with size limit error: "${errorMessage}" for analysis IDs: ${analysisIds.join(
        ', '
      )}`
    );
  } catch (updateError) {
    workerLogger.error(
      `Failed to update ListsAnalysisStatus for list ${listId}: ${updateError.message}`,
      updateError.stack
    );
    // Don't re-throw - this is a secondary operation that shouldn't fail the main process
  }
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
  try {
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
    class ListSizeLimitValidator extends AbstractHandler<ChainType> {
      private lastLoggedAt = 0;

      async handle(input: ChainType): Promise<ChainType> {
        const req = input.request as RequestNewList | undefined;
        const db = req?.organization_database;
        const listId = req?.list_id as number | undefined;
        const incomingFeaturesCount = Array.isArray(input.geojson)
          ? input.geojson.length
          : input.geojson?.features?.length ?? 0;

        if (db && listId && incomingFeaturesCount) {
          if (incomingFeaturesCount > MAX_LOCATIONS_PER_LIST) {
            const now = Date.now();
            if (now - this.lastLoggedAt > 5000) {
              workerLogger.warn(
                `Upload for list ${listId} in database ${db} contains ${incomingFeaturesCount} features, exceeding the maximum allowed ${MAX_LOCATIONS_PER_LIST}. Rejecting batch.`
              );
              this.lastLoggedAt = now;
            }
            throw new ListSizeLimitException(MAX_LOCATIONS_PER_LIST);
          }

          await checkListSizeLimit(db, listId, input.geojson);
        }
        return super.handle(input);
      }
    }
    const listSizeLimitValidator = new ListSizeLimitValidator();

    downloadS3File
      .setNext(parseData)
      .setNext(convertGeojsonProperties)
      .setNext(listSizeLimitValidator)
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
    cb(null);
  } catch (error) {
    if (error instanceof ListSizeLimitException) {
      workerLogger.warn(
        `List ${listId} in database ${organizationDatabase} exceeded size limit. ${error.message}`
      );

      // Update both upload status and analysis status in parallel
      // Using Promise.allSettled to ensure both operations complete even if one fails
      await Promise.allSettled([
        AbstractHandler.updateListsUploadStatus(
          chainType,
          'List size limit exceeded',
          error.message
        ),
        updateAnalysisStatusForSizeLimitError(
          organizationDatabase,
          listId,
          input.request.analysisIds || [],
          error.message
        ),
      ]);

      cb(null);
    } else {
      workerLogger.error(
        `Error processing list ${listId} in database ${organizationDatabase}: ${error.message}`,
        (error as Error)?.stack
      );
      cb(error as Error);
    }
  } finally {
    try {
      await connection.disconnect();
    } catch (disconnectError) {
      workerLogger.error(
        `Failed to disconnect from database ${organizationDatabase}: ${disconnectError.message}`,
        (disconnectError as Error)?.stack
      );
    }
  }
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
