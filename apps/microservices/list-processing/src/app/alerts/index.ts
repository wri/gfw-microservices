import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsRepository } from './alerts.repository';
import { SqlModule } from '@wri-monorepos/sql';

@Module({
  imports: [SqlModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
})
export class AlertsModule {}
