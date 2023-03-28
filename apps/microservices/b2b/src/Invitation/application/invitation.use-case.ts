import { Inject, Injectable } from '@nestjs/common';
import { DataServices } from '../../Shared/domain/data-service';
import { InvitationRepository } from '../../Invitation/domain/invitation.repository';
import { CreateInvitationDto } from '../../Invitation/application/dtos/invitation.dto';
import { InvitationDataMapper } from './invitation.mapper';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import { EmailService } from '@wri-monorepos/aws';

@Injectable()
export class InvitationUseCases {
  @Inject(EmailService)
  private readonly emailService: EmailService;

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

    if (result.isSuccess) {
      this.emailService.sendEmail(
        process.env.SES_SENDER_EMAIL,
        [invitation.targetEmail],
        `[GFW-PRO] You have a new connection invitation from ${invitation.sourceEmail} that belongs to the organization ${invitation.sourceOrganization}.`,
        'connectInvite',
        {
          sourceEmail: invitation.sourceEmail,
          sourceOrganization: invitation.sourceOrganization,
          targetEmail: invitation.targetEmail,
          targetOrganization: invitation.targetOrganization,
        },
      );
      return Result.ok(true);
    }
    return Result.fail(result.getError());
  }

  resendInvitation(id: any) {
    return this.invitationRepo.resendInvitation(id);
  }
}
