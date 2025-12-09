import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerConfigType, serverConfigSchema } from '../validators/server-config';

// This needs to be at the beginning of the file to ensure that the '.env' file
// is loaded into process.env before any code reads process.env
const envModule = ConfigModule.forRoot({
  envFilePath: ['.env', '.env.production'],
  validate: (env) => serverConfigSchema.parse(env),
  isGlobal: true,
});

import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TokenModule } from '../api-keys';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsAnalysisModule } from '../list-analysis';
import { EntitySchema } from 'typeorm';
import {
  TEST_ENVIRONMENT,
  CONNECTION_TYPE_SQLITE,
  CONNECTION_TYPE_MSSQL,
  SYSTEM_DATABASE,
  CLIENT_DATABASE,
} from '../config';
import { ApiKeyMiddleware } from '../middleware/api.middleware';
import { TraceIdMiddleware } from '@wri-monorepos/shared';
import { ListAnalysisMessageModule } from '../list-analysis-message-handler';
import { HealthModule } from '../health/health.module';
import { HttpModule } from '@nestjs/axios';
import { ExternalAPIKey, FeatureFlag, Organization, UserRoutes } from '@wri-monorepos/sql';

@Module({
  imports: [
    envModule,
    HttpModule,
    createTypeOrmModule('default', [Organization, ExternalAPIKey, UserRoutes, FeatureFlag]),
    TokenModule,
    ListsAnalysisModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  // Configure protected routes
  configure(consumer: MiddlewareConsumer) {
    // Apply trace ID middleware to all routes
    consumer.apply(TraceIdMiddleware).forRoutes('*path');

    // Apply API key middleware to protected routes
    consumer
      .apply(ApiKeyMiddleware)
      .forRoutes(
        '/v1/list/',
        '/v1/list/:listId',
        '/v1/list/:listId/analysis/:analysisId/status',
        '/v1/list/:listId/analysis/:analysisId/generate',
        '/v1/list/:listId/analysis/:analysisId/analyze',
        '/v1/list/:listId/delete',
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
    useFactory: async (config: ConfigService<ServerConfigType, true>) => {
      const env = config.get('NODE_ENV', { infer: true });
      const MSSQL_DATABASE = config.get('MSSQL_DATABASE', { infer: true });
      const MSSQL_PASSWORD = config.get('MSSQL_PASSWORD', { infer: true });

      return {
        name,
        type: env === TEST_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL,
        database:
          env === TEST_ENVIRONMENT
            ? name === 'default'
              ? SYSTEM_DATABASE
              : CLIENT_DATABASE
            : MSSQL_DATABASE,
        username: config.get('MSSQL_USERNAME', { infer: true }),
        password: MSSQL_PASSWORD,
        synchronize: env === TEST_ENVIRONMENT,
        entities,
        host: config.get('MSSQL_HOSTNAME', { infer: true }),
        port: config.get('MSSQL_PORT', { infer: true }),
        extra: {
          trustServerCertificate: true,
        },
      };
    },
  });
}
