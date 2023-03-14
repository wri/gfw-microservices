import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as sql from 'mssql';
import { CreateInvitationDto } from '../../Invitation/application/dtos/invitation.dto';
import { Invitation } from '../../Invitation/domain/invitation';
import { ParamStoreProcedure } from '../../Shared/infraestructure/mysql/store-procedure.params';

@Injectable()
export class InvitationDataMapper {
  createInvitationDtotoInvitation(invitationDto: CreateInvitationDto) {
    return plainToInstance(Invitation, invitationDto);
  }

  toProcedureParam(invitation: Invitation): ParamStoreProcedure[] {
    const params: ParamStoreProcedure[] = [
      {
        field: 'source_email',
        type: sql.NVarChar(250),
        value: invitation.sourceEmail,
      },
      {
        field: 'target_email',
        type: sql.NVarChar(250),
        value: invitation.targetEmail,
      },
      {
        field: 'source_organization',
        type: sql.Int(),
        value: invitation.sourceOrganization,
      },
      {
        field: 'target_organization',
        type: sql.Int(),
        value: invitation.targetOrganization,
      },
      {
        field: 'id_connection',
        type: sql.Int()
      },
    ];

    return params;
  }

  toIdParam(id: string): ParamStoreProcedure[] {
    return [
      {
        field: 'Id',
        type: sql.NVarChar(20),
        value: id,
      },
    ];
  }
}
