import { Injectable } from '@nestjs/common';
import { Invitation } from 'src/core/entities/invitation';

@Injectable()
export class InvitationUseCases {
  constructor(private dataServices: IDataServices) {}

  createInvitation(): Promise<Invitation[]> {
    return this.dataServices.invitation.create();
  }

  resendInvitation(id: any): Promise<Invitation> {
    return this.dataServices.invitation.resend(id);
  }
}
