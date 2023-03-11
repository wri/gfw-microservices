import { Body, Controller, Param, Post } from '@nestjs/common';
import { CreateInvitationDto } from '../application/dtos/invitation.dto';
import { InvitationUseCases } from '../application/invitation.use-case';

@Controller('api/invitation')
export class InvitationController {
  constructor(private invitationUseCases: InvitationUseCases) {}

  @Post()
  createInvitation(@Body() invitationDto: CreateInvitationDto) {
    console.log(this.invitationUseCases)
    return this.invitationUseCases.createInvitation(invitationDto);
  }

  @Post(':id')
  resendInvitation(@Param('id') invitationId: string) {
    return this.invitationUseCases.resendInvitation(invitationId);
  }
}
