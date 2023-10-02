import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from '../api-keys';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListsAnalysisModule } from '../list-analysis';
import { ExternalAPIKey } from '../api-keys/external-api-key.entity';
import { Organization } from '../api-keys/organization.entity';
import { User } from '../api-keys/user.entity';
import { ExternalUpload } from '../list-analysis/external-upload.entity';
import { EntitySchema } from 'typeorm';

const SYSTEM_DATABASE = 'db.default.sqlite';
const CLIENT_DATABASE = 'db.sqlite';
const CONNECTION_TYPE_MSSQL = 'mssql';
const CONNECTION_TYPE_SQLITE = 'sqlite';
const TEST_ENVIRONMENT = 'test';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.production'],
      isGlobal: true,
    }),
    createTypeOrmModule('default', [Organization]),
    createTypeOrmModule('client', [ExternalAPIKey, User, ExternalUpload]),
    TokenModule,
    ListsAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// eslint-disable-next-line @typescript-eslint/ban-types
function createTypeOrmModule(name: string, entities?: Array<Function | string | EntitySchema>) {
  return TypeOrmModule.forRootAsync({
    name,
    imports: [ConfigModule],
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
