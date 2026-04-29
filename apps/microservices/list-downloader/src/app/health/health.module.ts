import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';

import { HealthController } from './health.controller';
import { GitController } from './git.controller';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [envModule, TerminusModule],
  controllers: [HealthController, GitController],
})
export class HealthModule {}
