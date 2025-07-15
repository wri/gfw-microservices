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
import { S3Client } from '@aws-sdk/client-s3';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeleteListTypeOrm, SqlModule, TypeOrmSystemModule } from '@wri-monorepos/sql';
import { ListService } from '../services/list.service';
import { FCDModule } from './fcd';
import { SchedulerModule } from './scheduler';
import { AFIModule } from './afi';
import { AlertsModule } from './alerts';
import { ListUploadModule } from './list-upload';
import { AwsModule } from '@wri-monorepos/aws';
import { HealthModule } from './health/health.module';
import { ListModule } from './list';
import { GHGModule } from './ghg';
import { ListCopyMoveModule } from './list-copy-move';
import { ConvertersModule } from './converters';
import { TraceIdMiddleware } from '@wri-monorepos/shared';
import { GeoModule, GeoService } from '@wri-monorepos/geo';
import { ListPaginationService } from './list/list.pagination.service';

@Module({
  imports: [
    envModule,
    TypeOrmSystemModule.create({
      name: 'default',
      imports: [SchedulerModule],
    }),
    AFIModule,
    AlertsModule,
    AwsModule,
    ConvertersModule,
    FCDModule,
    GeoModule,
    GHGModule,
    HealthModule,
    ListUploadModule,
    ListModule,
    ListCopyMoveModule,
    SchedulerModule,
    SqlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ListPaginationService,
    GeoService,
    ListService,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply trace ID middleware to all routes
    consumer.apply(TraceIdMiddleware).forRoutes('*path');
  }
}
