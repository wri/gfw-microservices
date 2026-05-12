import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { GitController } from './git.controller';

@Module({
  controllers: [HealthController, GitController],
})
export class HealthModule {}
