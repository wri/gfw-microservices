import { Body, Controller, HttpException, Param, Post } from '@nestjs/common';
import { CreateInvitationDto } from '../application/dtos/invitation.dto';
import { InvitationUseCases } from '../application/invitation.use-case';

@Controller('api/invitation')
export class InvitationController {
  constructor(private invitationUseCases: InvitationUseCases) {}

  @Post()
  async createInvitation(@Body() invitationDto: CreateInvitationDto) {
    const result = await this.invitationUseCases.sendInvitation(invitationDto);

    if (result.isSuccess) return { msg: 'Invitation sent' };
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @Post(':id')
  resendInvitation(@Param('id') invitationId: string) {
    return this.invitationUseCases.resendInvitation(invitationId);
  }
}
