import { Inject, Injectable } from '@nestjs/common';
import { DataServices } from '../../Shared/domain/data-service';
import { InvitationRepository } from '../../Invitation/domain/invitation.repository';
import { CreateInvitationDto } from '../../Invitation/application/dtos/invitation.dto';
import { InvitationDataMapper } from './invitation.mapper';

@Injectable()
export class InvitationUseCases {
  constructor(
    private invitationRepo: InvitationRepository,
    private mapper: InvitationDataMapper,
  ) {}

  async createInvitation(invitationDto: CreateInvitationDto): Promise<boolean> {
    const invitation =
      this.mapper.createInvitationDtotoInvitation(invitationDto);
    const resultRepo = await this.invitationRepo.createInvitation(invitation);
    const result = resultRepo && resultRepo !== -1 ? true : false;
    return result;
  }

  resendInvitation(id: any): Promise<void> {
    return this.invitationRepo.resendInvitation(id);
  }
}
