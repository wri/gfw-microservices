import { Module } from '@nestjs/common';
import { DataServicesModule } from '../../Shared/application/data-service/data-service.module';
import { InvitationDataMapper } from './invitation.mapper';
import { InvitationUseCases } from './invitation.use-case';

@Module({
  imports: [DataServicesModule],
  providers: [InvitationDataMapper, InvitationUseCases],
  exports: [InvitationDataMapper, InvitationUseCases],
})
export class InvitationUseCasesModule {}
