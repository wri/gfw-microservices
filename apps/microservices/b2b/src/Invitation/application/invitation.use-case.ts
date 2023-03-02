import { Injectable } from '@nestjs/common';
import { DataServices } from 'src/Shared/domain/data-service';
import { InvitationRepository } from 'src/Invitation/domain/invitation.repository';
import { CreateInvitationDto } from 'src/Invitation/application/dtos/invitation.dto';
import { InvitationDataMapper } from './invitation.mapper';

@Injectable()
export class InvitationUseCases {
  private invitationRepo: InvitationRepository;

  constructor(dataServices: DataServices) {
    this.invitationRepo = dataServices.invitation;
  }

  createInvitation(invitationDto: CreateInvitationDto): Promise<void> {
    const invitation =
      InvitationDataMapper.createInvitationDtotoInvitation(invitationDto);
    return this.invitationRepo.createInvitation(invitation);
  }

  resendInvitation(id: any): Promise<void> {
    return this.invitationRepo.resendInvitation(id);
  }
}
