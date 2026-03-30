import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { DataSourceOptions } from 'typeorm';

import { HealthController } from './health.controller';
import { GitController } from './git.controller';
import { ServerConfigType } from '../../validators/server-config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [
    envModule,
    TerminusModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ServerConfigType, true>) => {
        return {
          type: 'mssql',
          host: configService.get('MSSQL_HOSTNAME', { infer: true }),
          port: configService.get('MSSQL_PORT', { infer: true }),
          username: configService.get('MSSQL_USERNAME', { infer: true }),
          password: configService.get('MSSQL_PASSWORD', { infer: true }),
          database: configService.get('MSSQL_DATABASE', { infer: true }),
          entities: [],
          extra: {
            trustServerCertificate: true,
            options: {
              connectTimeout: 30000,
              requestTimeout: 15000,
            },
          },
          poolSize: 5,
        } as DataSourceOptions;
      },
    }),
  ],
  controllers: [HealthController, GitController],
})
export class HealthModule {}
