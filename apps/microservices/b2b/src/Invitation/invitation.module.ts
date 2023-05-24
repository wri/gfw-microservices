import { Module } from '@nestjs/common';
import { InvitationRepository } from './domain/invitation.repository';
import { InvitationRepositoryMysql } from './infrastructure/invitation.repository.mysql';
import { InvitationDataMapper } from './application/invitation.mapper';
import { InvitationUseCases } from './application/invitation.use-case';
import { AwsModule } from '@wri-monorepos/aws';

@Module({
  imports: [AwsModule],
  providers: [
    InvitationDataMapper,
    InvitationUseCases,
    { provide: InvitationRepository, useClass: InvitationRepositoryMysql },
  ],
  exports: [InvitationDataMapper, InvitationUseCases],
})
export class InvitationUseCasesModule {}
