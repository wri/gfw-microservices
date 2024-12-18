import { Injectable, Logger } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { S3Service } from '@wri-monorepos/aws';
import { AbstractHandler, ChainEvent } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { GADMService } from './chain/gadm.service';
import { InsertLocationData } from './chain/insert.location.data';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';
import { StartAnalysis } from './chain/start.analysis';
import { ConvertPoint2Polygon } from './chain/convert.point.2.polygon';
import { logExecutionTime } from './chain/shared';
import { WriteLocationCount } from './chain/write.location.count';
import { SaveListAttributes } from './chain/save.list.attributes';
import { ProcessUploadData } from './chain/process.upload.data';
import { ListSchemaName } from './chain/list.schema.name';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChainEvents extends EventEmitter2 {
  private readonly logger = new Logger(ChainEvents.name);
  private convertPoint2Polygon: ConvertPoint2Polygon;
  private processUploadData: ProcessUploadData;
  // private queue: QueuePromise<unknown>;

  constructor(private readonly config: ConfigService<ServerConfigType, true>) {
    super({
      wildcard: true,
    });
    // this.queue = fastq.promise(this.chainJob, 1);
    this.convertPoint2Polygon = new ConvertPoint2Polygon();
    this.processUploadData = new ProcessUploadData();
    this.on('list.upload.start', this.startListUploadChains);
    this.on('list.upload.process.features', this.processListUploadGeojsonFeatures);
    this.on('list.upload.finish', this.finishListChains);
    this.on('list.upload.async.attributes', this.processListUploadAttributes);
    this.on('list.upload.done', () => {
      this.off('list.upload.start', this.startListUploadChains);
      this.off('list.upload.process.features', this.processListUploadGeojsonFeatures);
      this.off('list.upload.finish', this.finishListChains);
      this.off('list.upload.async.attributes', this.processListUploadAttributes);
    });
  }
  async chainJob(job, callback) {
    const { chain, chainPayload } = job;
    const result = this.runChain(chain, chainPayload);
    callback(result);
    return result;
  }

  dispatch(eventName: string, event: ChainEvent) {
    this.logger.log(`Dispatching: ${eventName} event`);
    this.emit(eventName, event);
  }

  async runChain<T>(chain: AbstractHandler<T>, chainPayload: T): Promise<T> {
    return await AbstractHandler.runFullChain(chain, chainPayload);
  }

  @logExecutionTime('list.upload.start')
  async startListUploadChains(event: ChainEvent) {
    const { payload } = event;
    const s3Service = new S3Service();
    const downloadS3File = new DownloadS3File(s3Service, this.config);
    const parseData = new ParserData();
    const listSchemaName = new ListSchemaName();

    downloadS3File.setNext(parseData).setNext(listSchemaName);

    const nextPayload = await this.runChain(downloadS3File, {
      request: payload.request,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    console.log('🚀 ~ ChainEventsListeners ~ startListUploadChain ~ nextPayload:', nextPayload);

    this.dispatch('list.upload.geojson.process', {
      ...event,
      payload: nextPayload,
    });
  }

  @logExecutionTime('list.upload.process.features')
  async processListUploadGeojsonFeatures(event: ChainEvent) {
    const { geojson } = event.payload;
    const { features: prevFeatures } = geojson;

    this.logger.log(`Total of Features: ${prevFeatures.length}.`);

    geojson.features = await Promise.all(
      prevFeatures.map(async (feature, index) => {
        feature.properties.locationId = index + 1;
        feature = await this.convertPoint2Polygon.processForFeature(feature);
        feature = await this.processUploadData.processForFeature(feature);
        return feature;
      })
    );

    const nextPayload: ChainEvent = {
      ...event,
      payload: {
        ...event.payload,
        geojson,
      },
    };

    this.dispatch('list.upload.finish', nextPayload);
    this.dispatch('list.upload.async.attributes', nextPayload);
  }

  @logExecutionTime('list.upload.finish')
  async finishListChains(event: ChainEvent) {
    const { payload: prevPayload } = event;

    const gadmService = new GADMService();
    const validateLatLongGeojson = new ValidateLatLongGeojson();
    const insertLocationData = new InsertLocationData();
    const writeLocationCount = new WriteLocationCount();
    const startAnalysis = new StartAnalysis();

    gadmService
      .setNext(gadmService) // depends on convertPoint2Polygon on each feature
      .setNext(validateLatLongGeojson) // depends on gadmService
      .setNext(insertLocationData)
      .setNext(writeLocationCount)
      .setNext(startAnalysis);

    const nextPayload = await this.runChain(gadmService, {
      ...prevPayload,
    });

    const doneEvent = {
      ...event,
      payload: nextPayload,
    };

    this.dispatch('list.upload.done', doneEvent);
  }

  @logExecutionTime('list.upload.async.attributes')
  async processListUploadAttributes(event: ChainEvent) {
    const { payload: prevPayload } = event;

    const saveListAttributes = new SaveListAttributes();

    await this.runChain(saveListAttributes, prevPayload);
  }
}

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(
    private readonly config: ConfigService<ServerConfigType, true>,
    private chainEvents: ChainEvents
  ) {
    this.chainEvents = new ChainEvents(this.config);
  }

  @logExecutionTime(StartAnalysisService.name)
  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    this.chainEvents.dispatch('list.upload.start', {
      eventId: uuidv4(),
      payload: { request },
    });

    return {
      executionArn: '',
      startDate: new Date().toISOString(),
    };
  }
}
