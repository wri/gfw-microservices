import { Inject, Injectable } from '@nestjs/common';
import { DataServices } from '../../Shared/domain/data-service';
import { InvitationRepository } from '../../Invitation/domain/invitation.repository';
import { CreateInvitationDto } from '../../Invitation/application/dtos/invitation.dto';
import { InvitationDataMapper } from './invitation.mapper';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import { EmailService } from '@wri-monorepos/aws';
import { LogsUseCases } from '../../Logs/application/log.use-case';
import { ActivityType } from '../../Logs/application/dtos/log.dto';

@Injectable()
export class InvitationUseCases {
  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(LogsUseCases)
  private readonly logsUseCases: LogsUseCases;

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
      console.log(invitationDto);

      this.logsUseCases.saveActivityLog({
        activityType: ActivityType.ConnectionRequested,
        userEmail: invitationDto.sourceEmail,
        organizationTarget: invitationDto.sourceOrganization,
        description: `${invitationDto.sourceEmail} Has requested to make a trusted connection to ${invitationDto.targetOrganization}`,
      });

      this.logsUseCases.saveActivityLog({
        activityType: ActivityType.ConnectionRequested,
        userEmail: invitationDto.targetEmail,
        organizationTarget: invitationDto.targetOrganization,
        description: `${invitationDto.sourceEmail} from ${invitationDto.sourceOrganization} Has requested to make a trusted conect`,
      });

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
