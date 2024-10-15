import { Injectable, Logger } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { S3Service } from '@wri-monorepos/aws';
import { ChainType } from './chain/types';
import { DownloadS3File } from './chain/download.s3.file';
import { ParserData } from './chain/parser.data';
import { ListSchemaName } from './chain/list.schema.name';
import { CreateLocationSchema } from './chain/create.location.schema';
import { SQLUtils } from '@wri-monorepos/sql';
import { GADMService } from './chain/gadm.service';
import { CreateListLevelData } from './chain/create.list.level.data';
import { InsertLocationData } from './chain/insert.location.data';
import { ValidateLatLongGeojson } from './chain/validate.lat.long.geojson';

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

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

    downloadS3File
      .setNext(parseData)
      .setNext(listSchemaName)
      .setNext(gadmService)
      .setNext(validateLatLongGeojson)
      .setNext(createListLevelData)
      .setNext(createLocationSchema)
      .setNext(insertLocationData);

    await downloadS3File.handle(chainType);

    await connection.disconnect();
    return {
      executionArn: '',
      startDate: '',
    };
  }
}
