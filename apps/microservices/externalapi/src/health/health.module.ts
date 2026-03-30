// health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config/dist';
import { GitController } from './git.controller';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [
    envModule,
    TerminusModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbConfig: DataSourceOptions = {
          type: 'mssql',
          host: process.env.MSSQL_HOSTNAME,
          port: parseInt(process.env.MSSQL_PORT, 10),
          username: process.env.MSSQL_USERNAME,
          password: process.env.MSSQL_PASSWORD,
          database: process.env.MSSQL_DATABASE,
          entities: [],
          extra: {
            trustServerCertificate: true,
            options: {
              connectTimeout: 30000,
              requestTimeout: 15000,
            },
            pool: {
              max: 5,
              min: 1,
              idleTimeoutMillis: 30000,
            },
          },
        };
        return dbConfig;
      },
    }),
  ],
  controllers: [HealthController, GitController],
})
export class HealthModule {}
