import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import * as sql from 'mssql';
import { CreateInvitationDto } from '../../Invitation/application/dtos/invitation.dto';
import { Invitation } from '../../Invitation/domain/invitation';
import { ParamStoreProcedure } from '../../Shared/infraestructure/mysql/store-procedure.params';

@Injectable()
export class InvitationDataMapper {
  static createInvitationDtotoInvitation(invitationDto: CreateInvitationDto) {
    return plainToInstance(Invitation, invitationDto);
  }

  static toProcedureParam(invitation: Invitation): ParamStoreProcedure[] {
    const params: ParamStoreProcedure[] = [
      {
        field: 'Addressees',
        type: sql.NVarChar(50),
        value: invitation.addressees,
      },
    ];

    return params;
  }

  static toIdParam(id: string): ParamStoreProcedure[] {
    return [
      {
        field: 'Id',
        type: sql.NVarChar(20),
        value: id,
      },
    ];
  }
}
