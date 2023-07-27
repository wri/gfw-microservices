import { Inject, Injectable } from '@nestjs/common';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { ConnectionStatus } from '../../Connection/domain/connection';
import { ConnectionRepositorySP } from '../domain/connection.repository.sp';
import { ConnectionDataMapper } from './connection.mapper';
import { ConnectionAdminOrganizationDto } from './dtos/connection-admin-organizations.dto';
import { ConnectionFiltersDto } from './dtos/connection-filters.dto';
import { ConnectionGetDto } from './dtos/connection-get.dto';
import {
  ConnectionUpdateStatusHttpDto,
  ConnectionChangeDto,
} from './dtos/connection-status.dto';
import { CreateConnectionDto } from './dtos/connection.dto';
import { EmailService } from '@wri-monorepos/aws';
import { ConnectionRequestRepository } from '../domain/connection.repository';
import { QueryCriteria } from '../../Shared/domain/criteria/query';
import { SearchResult } from '../../Shared/domain/types';
import { ConnectionRequest } from '../domain/connection.entity';
import { ActivityLogUseCases } from '../../ActivityLog/application/activity-log.use-case';
import { ConstantsConfigIds, B2bStatus } from '@wri-monorepos/constants';

@Injectable()
export class ConnectionUseCases {
  constructor(
    private connectionRepoSp: ConnectionRepositorySP,
    private connectionRepo: ConnectionRequestRepository,
    private mapper: ConnectionDataMapper,
    @Inject(ConstantsConfigIds.B2B_STATUS) private b2bStatusValues: B2bStatus,
  ) {}

  @Inject(ActivityLogUseCases)
  private readonly logsUseCases: ActivityLogUseCases;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  async getConnections(
    filtersDto: ConnectionFiltersDto,
  ): ResultPromise<ConnectionGetDto[]> {
    const connectionsRes = await this.connectionRepoSp.getConnections(
      filtersDto,
    );

    if (connectionsRes.isSuccess) {
      const connections = connectionsRes.getValue();
      const connectionsGetDto: ConnectionGetDto[] = connections.map(
        (connection) => this.mapper.connectionToGetDto(connection),
      );
      console.log(connectionsGetDto);
      return Result.ok(connectionsGetDto);
    }
    return Result.fail(connectionsRes.getError());
  }

  async createConnection(
    createConnectionDto: CreateConnectionDto,
  ): ResultPromise<boolean> {
    const invitation =
      this.mapper.createConnectionDtotoConnectionInvitation(
        createConnectionDto,
      );
    const result = await this.connectionRepoSp.createConnection(invitation);

    if (result.isSuccess) {
      this.logsUseCases.saveActivityLog({
        activityType: this.b2bStatusValues.ConnectionRequested,
        userEmail: createConnectionDto.sourceEmail,
        organizationTarget: createConnectionDto.sourceOrganization,
        description: `${createConnectionDto.sourceEmail} Has requested to make a trusted connection to ${createConnectionDto.targetOrganization}`,
      });

      this.logsUseCases.saveActivityLog({
        activityType: this.b2bStatusValues.ConnectionRequested,
        userEmail: createConnectionDto.targetEmail,
        organizationTarget: createConnectionDto.targetOrganization,
        description: `${createConnectionDto.sourceEmail} from ${createConnectionDto.sourceOrganization} Has requested to make a trusted conect`,
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

  resendConnection(id: number) {
    return this.connectionRepoSp.resendConnection(id);
  }

  async acceptConnection(
    id: number,
    acceptConnectionHttpDto: ConnectionUpdateStatusHttpDto,
  ): ResultPromise<boolean> {
    const changeStatusDto: ConnectionChangeDto = {
      editEmail: acceptConnectionHttpDto.editEmail,
      id,
      status: ConnectionStatus.accepted,
    };

    const result = await this.connectionRepoSp.updateStatusConnection(
      changeStatusDto,
    );
    if (result.isSuccess) {
      return Result.ok(true);
    }
    return Result.fail(result.getError());
  }

  async rejectConnection(
    id: number,
    rejectConnectionHttpDto: ConnectionUpdateStatusHttpDto,
  ): ResultPromise<boolean> {
    const changeStatusDto: ConnectionChangeDto = {
      editEmail: rejectConnectionHttpDto.editEmail,
      id,
      status: ConnectionStatus.rejected,
    };
    const result = await this.connectionRepoSp.updateStatusConnection(
      changeStatusDto,
    );
    if (result.isSuccess) return Result.ok(true);
    return Result.fail(result.getError());
  }

  async cancelConnection(
    id: number,
    cancelConnectionHttpDto: ConnectionUpdateStatusHttpDto,
  ): ResultPromise<boolean> {
    const changeStatusDto: ConnectionChangeDto = {
      editEmail: cancelConnectionHttpDto.editEmail,
      id,
      status: ConnectionStatus.cancelled,
    };
    const result = await this.connectionRepoSp.updateStatusConnection(
      changeStatusDto,
    );
    if (result.isSuccess) return Result.ok(true);
    return Result.fail(result.getError());
  }

  async search(
    query: QueryCriteria,
    orgId: string,
  ): ResultPromise<SearchResult<ConnectionRequest>> {
    return this.connectionRepo.search(query, orgId);
  }

  async getConnectionRequestID(
    orgId1: number,
    orgId2: number,
  ): ResultPromise<ConnectionRequest> {
    return this.connectionRepo.getConnectionRequestID(orgId1, orgId2);
  }

  async checkUserBelongsToOrgAndIsAdmin(
    email: string,
    organizationName: string,
  ) {
    const result = await this.connectionRepoSp.getUserAdminOrganization(email);
    const userOrganizations = result.getValue();
    if (userOrganizations && userOrganizations.length > 0) {
      const org = userOrganizations.find(
        (org) => org.organizationName === organizationName,
      );
      if (org) {
        return Result.ok(org);
      }
    }
    return Result.fail('User does not belong to organization or is not admin');
  }

  //TODO: move to user service
  async getOrganizationsByUser(
    email: string,
  ): ResultPromise<ConnectionAdminOrganizationDto[]> {
    const result = await this.connectionRepoSp.getUserAdminOrganization(email);
    if (result.isSuccess) return Result.ok(result.getValue());
    return Result.fail(result.getError());
  }
}
