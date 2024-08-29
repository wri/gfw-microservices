import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmSystemModule } from '@wri-monorepos/sql';
import { PipeModule } from './pipe/pipe.module';
import { HealthModule } from './health/health.module';
import { ListModule } from './handler/list.module';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});
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
