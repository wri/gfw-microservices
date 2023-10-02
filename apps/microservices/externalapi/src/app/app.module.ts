import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from '../api-keys';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalAPIKey } from '../api-keys/external-api-key.entity';
import { Organization } from '../api-keys/organization.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../api-keys/user.entity';
import { ListsAnalysisModule } from '../list-analysis';
import { ExternalUpload } from '../list-analysis/external-upload.entity';
const SYSTEM_DATABASE = 'db.default.sqlite';
const CLIENT_DATABASE = 'db.sqlite';
const CONNECTION_TYPE_MSSQL = 'mssql';
const CONNECTION_TYPE_SQLITE = 'sqlite';
const DEVELOPMENT_ENVIRONMENT = 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.production'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const env = config.get<string>('NODE_ENV');
        console.log('env', env);
        return {
          name: 'default',
          type: env === DEVELOPMENT_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL,
          database:
            env === DEVELOPMENT_ENVIRONMENT
              ? SYSTEM_DATABASE
              : config.get<string>('MSSQL_DATABASE'),
          synchronize: env === DEVELOPMENT_ENVIRONMENT ? true : false,
          logging: true,
          entities: [Organization],
          host: config.get<string>('MSSQL_HOSTNAME'),
          port: parseInt(config.get<string>('MSSQL_PORT'), 10),
          extra: {
            trustServerCertificate: true,
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'client',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const env = config.get<string>('NODE_ENV');
        console.log('env', env);
        return {
          name: 'client',
          type: env === DEVELOPMENT_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL,
          database:
            env === DEVELOPMENT_ENVIRONMENT
              ? CLIENT_DATABASE
              : config.get<string>('MSSQL_DATABASE'),
          synchronize: env === DEVELOPMENT_ENVIRONMENT ? true : false,
          logging: true,
          entities: [ExternalAPIKey, User, ExternalUpload],
          host: config.get<string>('MSSQL_HOSTNAME'),
          port: parseInt(config.get<string>('MSSQL_PORT'), 10),
          extra: {
            trustServerCertificate: true,
          },
        };
      },
    }),
    TokenModule,
    ListsAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
