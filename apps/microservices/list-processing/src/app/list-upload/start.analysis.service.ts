import { Injectable, Logger } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { S3Service } from '@wri-monorepos/aws';
import { AbstractHandler, ChainType } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { ListSchemaName } from './chain/list.schema.name';
import { CreateLocationSchema } from './chain/create.location.schema';
import { SQLUtils } from '@wri-monorepos/sql';
import { GADMService } from './chain/gadm.service';
import { CreateListLevelData } from './chain/create.list.level.data';
import { InsertLocationData } from './chain/insert.location.data';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';
import { StartAnalysis } from './chain/start.analysis';
import { ConvertPoint2Polygon } from './chain/convert.point.2.polygon';
import { GetObjectTypes } from './chain/getobject.types';
import { logExecutionTime } from './chain/shared';
import { WriteLocationCount } from './chain/write.location.count';

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  @logExecutionTime(StartAnalysisService.name)
  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    const { organization_database: organizationDatabase } = request;

    const chainType: ChainType = {
      request,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const connection = new SQLUtils();
    await connection.connect(organizationDatabase);

    const downloadS3File = new DownloadS3File(this.s3Service, this.config);
    const parseData = new ParserData();
    const listSchemaName = new ListSchemaName();
    const gadmService = new GADMService();
    const createListLevelData = new CreateListLevelData();
    const createLocationSchema = new CreateLocationSchema(connection);
    const insertLocationData = new InsertLocationData(null);
    const validateLatLongGeojson = new ValidateLatLongGeojson();
    const convertPoint2Polygon = new ConvertPoint2Polygon();
    const startAnalysis = new StartAnalysis(null);
    const getObjectTypes = new GetObjectTypes();
    const writeLocationCount = new WriteLocationCount(null);

    downloadS3File
      .setNext(parseData)
      .setNext(validateLatLongGeojson)
      .setNext(listSchemaName)
      .setNext(convertPoint2Polygon)
      .setNext(gadmService)
      .setNext(getObjectTypes)
      .setNext(createListLevelData)
      .setNext(createLocationSchema)
      .setNext(insertLocationData)
      .setNext(writeLocationCount)
      .setNext(startAnalysis);

    await AbstractHandler.runFullChain(downloadS3File, chainType);

    await connection.disconnect();
    return {
      executionArn: '',
      startDate: '',
    };
  }
}
