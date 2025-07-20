import { ConfigModule } from '@nestjs/config';
import { serverConfigSchema } from '../validators/server-config';

// This needs to be at the beginning of the file to ensure that the '.env' file
// is loaded into process.env before any code reads process.env
const envModule = ConfigModule.forRoot({
  envFilePath: ['.env', '.env.production'],
  validate: (env) => serverConfigSchema.parse(env),
  isGlobal: true,
});

import { Module, MiddlewareConsumer } from '@nestjs/common';

import { SqlModule, TypeOrmSystemModule } from '@wri-monorepos/sql';
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
import { GeoModule } from '@wri-monorepos/geo';

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
    ListCopyMoveModule,
    ListModule,
    ListUploadModule,
    SchedulerModule,
    SqlModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply trace ID middleware to all routes
    consumer.apply(TraceIdMiddleware).forRoutes('*path');
  }
}
