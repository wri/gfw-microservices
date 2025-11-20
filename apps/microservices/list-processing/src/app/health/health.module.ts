// health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config/dist';
import { GitController } from './git.controller';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [envModule],
  controllers: [HealthController, GitController],
})
export class HealthModule {}
