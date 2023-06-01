import { plainToInstance } from 'class-transformer';
import * as sql from 'mssql';
import {
  Connection,
  ConnectionStatus,
} from '../../Connection/domain/connection';
import { ParamStoreProcedure } from '../../Shared/infraestructure/mysql/store-procedure.params';
import { Injectable } from '@nestjs/common';
import { GenericMapper } from '../../Shared/domain/mapper';
import {
  ConnectionAdminOrganizationDbDto,
  ConnectionAdminOrganizationDto,
} from './dtos/connection-admin-organizations.dto';
import { ConnectionDbDto } from './dtos/connection-db.dto';
import { ConnectionFiltersDto } from './dtos/connection-filters.dto';
import { ConnectionGetDto } from './dtos/connection-get.dto';
import { ConnectionChangeDto } from './dtos/connection-status.dto';
import { CreateConnectionDto } from './dtos/connection.dto';
import { ConnectionInvitation } from '../domain/connection';

@Injectable()
export class ConnectionDataMapper extends GenericMapper {
  static createConnectionDtotoConnection(connectionDto: ConnectionGetDto) {
    return plainToInstance(Connection, connectionDto);
  }

  createConnectionDtotoConnectionInvitation(
    invitationDto: CreateConnectionDto,
  ) {
    return plainToInstance(ConnectionInvitation, invitationDto);
  }

  toGetProcedureParam(filtersDto: ConnectionFiltersDto): ParamStoreProcedure[] {
    const params: ParamStoreProcedure[] = [];

    const storeProcedureParams = {
      id: filtersDto.id,
      source_organization: filtersDto.sourceId,
      target_organization: filtersDto.targetId,
      status: filtersDto.status,
    };

    Object.entries(storeProcedureParams).forEach(([field, value]) => {
      if (value) {
        params.push({
          field: field,
          type: sql.NVarChar(20),
          value: String(value),
        });
      }
    });

    return params;
  }

  dbDtotoConnection(connectionDto: ConnectionDbDto): Connection {
    const connection: Connection = {
      id: connectionDto.id,
      createDate: new Date(connectionDto.create_date),
      editedDate: new Date(connectionDto.edited_date),
      description: connectionDto.description,
      sourceEmail: connectionDto.source_email,
      editorEmail: connectionDto.editor_email,
      sourceOrganization: connectionDto.source_organization,
      targetOrganization: connectionDto.target_organization,
      status: connectionDto.status as ConnectionStatus,
    };

    return plainToInstance(Connection, connection);
  }

  connectionToGetDto(connection: Connection): ConnectionGetDto {
    const getDto: ConnectionGetDto = {
      id: connection.id,
      createDate: connection.createDate.toDateString(),
      editedDate: connection.editedDate.toDateString(),
      description: connection.description,
      sourceEmail: connection.sourceEmail,
      editorEmail: connection.editorEmail,
      sourceOrganizationName: connection.sourceOrganization,
      targetOrganizationName: connection.targetOrganization,
      status: connection.status,
    };

    return plainToInstance(ConnectionGetDto, getDto);
  }

  toAdminOrganizationDto(
    dbDto: ConnectionAdminOrganizationDbDto,
  ): ConnectionAdminOrganizationDto {
    return {
      organizationId: dbDto.id,
      organizationName: dbDto.organization_name,
    };
  }

  toChangeStatusConnectionParam(
    connectionChangeDto: ConnectionChangeDto,
  ): ParamStoreProcedure[] {
    return [
      {
        field: 'edit_email',
        type: sql.NVarChar(250),
        value: connectionChangeDto.editEmail,
      },
      {
        field: 'id_connection_request',
        type: sql.Int(),
        value: connectionChangeDto.id,
      },
      {
        field: 'status',
        type: sql.NVarChar(20),
        value: connectionChangeDto.status,
      },
    ];
  }

  toIdParam(id: number): ParamStoreProcedure[] {
    return [
      {
        field: 'Id',
        type: sql.NVarChar(20),
        value: id,
      },
    ];
  }

  toCreateConnectionProcedureParam(
    connectionInvitation: ConnectionInvitation,
  ): ParamStoreProcedure[] {
    const params: ParamStoreProcedure[] = [
      {
        field: 'source_email',
        type: sql.NVarChar(250),
        value: connectionInvitation.sourceEmail,
      },
      {
        field: 'target_email',
        type: sql.NVarChar(250),
        value: connectionInvitation.targetEmail,
      },
      {
        field: 'source_organization',
        type: sql.Int(),
        value: connectionInvitation.sourceOrganization,
      },
      {
        field: 'target_organization',
        type: sql.Int(),
        value: connectionInvitation.targetOrganization,
      },
    ];

    return params;
  }
}
