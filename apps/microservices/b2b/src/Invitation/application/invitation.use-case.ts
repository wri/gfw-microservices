import { Inject, Injectable } from '@nestjs/common';
import { DataServices } from '../../Shared/domain/data-service';
import { InvitationRepository } from '../../Invitation/domain/invitation.repository';
import { CreateInvitationDto } from '../../Invitation/application/dtos/invitation.dto';
import { InvitationDataMapper } from './invitation.mapper';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';

@Injectable()
export class InvitationUseCases {
  constructor(
    private invitationRepo: InvitationRepository,
    private mapper: InvitationDataMapper,
  ) {}

  async sendInvitation(
    invitationDto: CreateInvitationDto,
  ): ResultPromise<boolean> {
    const invitation =
      this.mapper.createInvitationDtotoInvitation(invitationDto);
    const result = await this.invitationRepo.createInvitation(invitation);
    
    if (result.isSuccess) return Result.ok(true);
    return Result.fail(result.getError());
  }

  resendInvitation(id: any) {
    return this.invitationRepo.resendInvitation(id);
  }
}
