import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { serverConfigSchema } from '../validators/server-config';

// This needs to be at the beginning of the file to ensure that the '.env' file
// is loaded into process.env before any code reads process.env
const envModule = ConfigModule.forRoot({
  envFilePath: ['.env', '.env.production'],
  validate: (env) => serverConfigSchema.parse(env),
  isGlobal: true,
});

import { TypeOrmSystemModule } from '@wri-monorepos/sql';
import { PipeModule } from './pipe/pipe.module';
import { HealthModule } from './health/health.module';
import { ListModule } from './handler/list.module';

@Module({
  imports: [
    envModule,
    HealthModule,
    ListModule,
    TypeOrmSystemModule.create({ name: 'default', imports: [PipeModule] }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
