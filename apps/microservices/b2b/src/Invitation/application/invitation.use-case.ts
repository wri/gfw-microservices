import { Injectable } from '@nestjs/common';
import { DataServices } from '../../Shared/domain/data-service';
import { InvitationRepository } from '../domain/invitation.repository';
import { CreateInvitationDto } from '../application/dtos/invitation.dto';
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
