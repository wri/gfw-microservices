import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from '../api-keys';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListsAnalysisModule } from '../list-analysis';
import { ExternalAPIKey } from '../api-keys/external-api-key.entity';
import { Organization } from '../api-keys/organization.entity';
import { UserRoutes } from '../api-keys/user-route.entity';
import { EntitySchema } from 'typeorm';
import {
  TEST_ENVIRONMENT,
  CONNECTION_TYPE_SQLITE,
  CONNECTION_TYPE_MSSQL,
  SYSTEM_DATABASE,
  CLIENT_DATABASE,
} from '../config';
import { ApiKeyMiddleware } from '../middleware/api.middleware';
import { ListAnalysisMessageModule } from '../list-analysis-message-handler';

// This needs to be at the beginning of the file to ensure that the '.env' file
// is loaded into process.env before any code reads process.env
const envModule = ConfigModule.forRoot({
  envFilePath: ['.env', '.env.production'],
  isGlobal: true,
});

@Module({
  imports: [
    envModule,
    createTypeOrmModule('default', [Organization, ExternalAPIKey, UserRoutes]),
    TokenModule,
    ListsAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // Configure protected routes
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .forRoutes(
        '/v1/list/',
        '/v1/list/:listId',
        '/v1/list/:listId/analysis/:analysisId/status',
        '/v1/list/:listId/analysis/Alerts/generate',
        '/v1/list/:listId/delete/list',
        '/v1/list/upload_new',
        '/v1/prepare_upload'
      );
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function createTypeOrmModule(name: string, entities?: Array<Function | string | EntitySchema>) {
  return TypeOrmModule.forRootAsync({
    name,
    imports: [ConfigModule, ListAnalysisMessageModule],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const env = config.get<string>('NODE_ENV');
      return {
        name,
        type: env === TEST_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL,
        database:
          env === TEST_ENVIRONMENT
            ? name === 'default'
              ? SYSTEM_DATABASE
              : CLIENT_DATABASE
            : config.get<string>('MSSQL_DATABASE'),
        username: config.get<string>('MSSQL_USERNAME'),
        password: config.get<string>('MSSQL_PASSWORD'),
        synchronize: env === TEST_ENVIRONMENT,
        logging: true,
        entities,
        host: config.get<string>('MSSQL_HOSTNAME'),
        port: parseInt(config.get<string>('MSSQL_PORT'), 10),
        extra: {
          trustServerCertificate: true,
        },
      };
    },
  });
}
