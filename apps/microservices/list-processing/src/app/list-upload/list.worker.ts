import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { EmailService } from '@wri-monorepos/aws';
import { RequestLargeListProcess } from '../../models';
import { AbstractHandler, ChainType } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { GADMService } from './chain/gadm.service';
import { ClipToLandService } from './chain/clipToLand.service';
import { InsertLocationData } from './chain/insert.location.data';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';
import { StartAnalysis } from './chain/start.analysis';
import { SQLUtils } from '@wri-monorepos/sql';
import { WriteLocationCount } from './chain/write.location.count';
import { ProcessUploadData } from './chain/process.upload.data';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import type { done } from 'fastq';
import { ListSchemaName } from './chain/list.schema.name';
import { ConvertPoint2Polygon } from './chain/convert.point.2.polygon';
import { ValidateMandatoryFields } from './chain/validate.mandatory.fields';
import { ValidateLocationName } from './chain/validate.location.name';
import { AddNewLocationToAnalysisTable } from './chain/add.new.location.to.analysis.table';
import { ConvertGeojsonProperties } from './chain/convert.geojson.properties';
import { PutListAsDraft } from './chain/put.list.as.draft';
import { GenerateErrorFile } from './chain/generate.error.file';
import { AdjustGeoData } from './chain/adjust.geo.data';
import { S3Service } from '@wri-monorepos/aws';

type WorkerType = {
  request: RequestLargeListProcess;
  config: ConfigService<ServerConfigType, true>;
  emailService: EmailService;
};

export async function clearErrorFile(organizationDatabase: string, listId: number) {
  const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
  const listRepository = connection.getRepository(Lists);
  await listRepository.update({ id: listId }, { errorFileStoragePath: null });
}

export async function worker(input: WorkerType, cb: done) {
  const logger = new Logger('ListWorker');
  const { organization_database: organizationDatabase, list_id: listId } = input.request;

  try {
    logger.log(`[List ${listId}] Starting worker process...`);

    // Clear any existing error file before starting analysis
    logger.log(`[List ${listId}] Clearing error files...`);
    await clearErrorFile(organizationDatabase, listId);

    const chainType: ChainType = {
      request: input.request,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    logger.log(`[List ${listId}] Connecting to database: ${organizationDatabase}`);
    const connection = new SQLUtils();
    const s3Service = new S3Service();
    await connection.connect(organizationDatabase);
    logger.log(`[List ${listId}] Database connected successfully`);

    logger.log(`[List ${listId}] Initializing processing chain...`);
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

    logger.log(`[List ${listId}] Setting up processing chain...`);
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

    logger.log(`[List ${listId}] Starting processing chain execution...`);

    // Add overall timeout wrapper for the entire chain execution
    const chainPromise = AbstractHandler.runFullChain(downloadS3File, chainType);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Chain execution timeout after 25 minutes for list ${listId}`));
      }, 25 * 60 * 1000); // 25 minute timeout for entire chain
    });

    await Promise.race([chainPromise, timeoutPromise]);

    logger.log(`[List ${listId}] Chain execution completed, disconnecting database...`);
    await connection.disconnect();

    logger.log(`[List ${listId}] Successfully completed processing`);
    cb(null);
  } catch (error) {
    logger.error(`[List ${listId}] Error in worker:`, error);
    logger.error(`[List ${listId}] Error stack:`, error.stack);
    cb(error);
  }
}

// Promise-based wrapper for easier async/await usage
export async function workerPromise(input: WorkerType): Promise<void> {
  return new Promise((resolve, reject) => {
    let completed = false;

    worker(input, (error) => {
      if (completed) {
        return; // Prevent double completion
      }
      completed = true;

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
