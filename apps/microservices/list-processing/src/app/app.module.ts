import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerConfigType, serverConfigSchema } from '../validators/server-config';

// This needs to be at the beginning of the file to ensure that the '.env' file
// is loaded into process.env before any code reads process.env
const envModule = ConfigModule.forRoot({
  envFilePath: ['.env', '.env.production'],
  validate: (env) => serverConfigSchema.parse(env),
  isGlobal: true,
});

import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeleteListTypeOrm, SqlModule, TypeOrmSystemModule } from '@wri-monorepos/sql';
import { LocationService } from '../services/locations.service';
import { ListService } from '../services/list.service';
import { LockListService } from '../services/lock.list.service';
import { GeoService } from '@wri-monorepos/geo';
import { ListPaginationService } from '../services/list.pagination.service';
import { FCDModule } from './fcd';
import { SchedulerModule } from './scheduler';
import { AFIModule } from './afi';
import { AlertsModule } from './alerts';
import { ListUploadModule } from './list-upload';
import { AwsModule } from '@wri-monorepos/aws';
import { HealthModule } from './health/health.module';
import { ListModule } from './list';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    envModule,
    TypeOrmSystemModule.create({
      name: 'default',
      imports: [SchedulerModule],
    }),
    SqlModule,
    FCDModule,
    AFIModule,
    SchedulerModule,
    AlertsModule,
    EventEmitterModule.forRoot(),
    ListUploadModule,
    AwsModule,
    HealthModule,
    ListModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ListPaginationService,
    LocationService,
    GeoService,
    ListService,
    LockListService,
    DeleteListTypeOrm,
    {
      provide: 'S3Client',
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ServerConfigType, true>) => {
        return new S3Client({
          region: configService.get('AWS_REGION', { infer: true }),
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID', { infer: true }),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY', { infer: true }),
          },
        });
      },
    },
  ],
})
export class AppModule {}
