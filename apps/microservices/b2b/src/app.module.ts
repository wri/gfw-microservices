import { Module } from '@nestjs/common';
import { AppController } from './Shared/infraestructure/app.controller';
import { AppService } from './Shared/application/app.service';
import { DataServicesModule } from './Shared/application/data-service/data-service.module';
import { ConnectionController } from './Connection/infraestructure/connection.controller';
import { ConnectionUseCasesModule } from './Connection/connection.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogsModule } from './Logs/log.module';
import { UserModule } from './User/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './Shared/infraestructure/typeorm/entities';
import { DatabaseProvider } from './Shared/domain/database-provider/database.provider';
import { DataSourceOptions } from 'typeorm';
import { ListController } from './List/infrastructure/list.controller';
import { ListModule } from './List/list.module';

@Module({
  imports: [
    UserModule,
    ConnectionUseCasesModule,
    LogsModule,
    ListModule,
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
          entities: entities, //[__dirname + '/**/*.entity{.ts,.js}'],
          extra: {
            trustServerCertificate: true,
          },
        };
        return dbConfig;
      },
    }),
  ],
  controllers: [AppController, ConnectionController, ListController],
  providers: [AppService],
})
export class AppModule {}
