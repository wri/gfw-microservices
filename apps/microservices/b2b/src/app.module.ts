import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// This needs to be at the beginning of the file to ensure that the '.env' file
// is loaded into process.env before any code reads process.env
const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { AppController } from './Shared/infraestructure/app.controller';
import { AppService } from './Shared/application/app.service';
import { ConnectionController } from './Connection/infraestructure/connection.controller';
import { ConnectionModule } from './Connection/connection.module';
import { UserModule } from './User/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './Shared/infraestructure/typeorm/entities';
import { DataSourceOptions } from 'typeorm';
import { ListController } from './List/infrastructure/list.controller';
import { ListModule } from './List/list.module';
import { OrganizationModule } from './Organization/organization.module';
import { OrganizationController } from './Organization/infrastructure/organization.controller';
import { SharedListController } from './SharedList/infrastructure/shared-list.controller';
import { SharedListModule } from './SharedList/shared-list.module';
import { SharedModule } from './Shared/shared.module';
import { ActivityLogModule } from './ActivityLog/activity-log.module';

@Module({
  imports: [
    envModule,
    UserModule,
    ConnectionModule,
    OrganizationModule,
    SharedListModule,
    ActivityLogModule,
    ListModule,
    SharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbConfig: DataSourceOptions = {
          type: 'mssql',
          host: process.env.MSSQL_HOSTNAME,
          port: parseInt(process.env.MSSQL_PORT, 10),
          username: process.env.MSSQL_USERNAME,
          password: process.env.MSSQL_PASSWORD,
          database: process.env.MSSQL_DATABASE,
          entities: entities,
          extra: {
            trustServerCertificate: true,
          },
        };
        return dbConfig;
      },
    }),
  ],
  controllers: [
    AppController,
    ConnectionController,
    ListController,
    OrganizationController,
    SharedListController,
  ],
  providers: [AppService],
})
export class AppModule {}
