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

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    const chainType: ChainType = {
      request,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const { organization_database } = request;
    const connection = new SQLUtils({
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      database: organization_database,
      server: process.env.MSSQL_HOSTNAME,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      port: parseInt(process.env.MSSQL_PORT),
      options: {
        trustServerCertificate: true,
      },
      requestTimeout: 600000,
    });
    await connection.connect();

    const downloadS3File = new DownloadS3File(this.s3Service, this.config);
    const parseData = new ParserData();
    const listSchemaName = new ListSchemaName();
    const gadmService = new GADMService();
    const createListLevelData = new CreateListLevelData();
    const createLocationSchema = new CreateLocationSchema(connection);
    const insertLocationData = new InsertLocationData(connection);

    downloadS3File
      .setNext(parseData)
      .setNext(listSchemaName)
      .setNext(gadmService)
      .setNext(createLocationSchema)
      .setNext(createListLevelData)
      .setNext(createLocationSchema)
      .setNext(insertLocationData);

    const file = await downloadS3File.handle(chainType);

    console.log(file);
    return {
      executionArn: '',
      startDate: '',
    };
  }
}
