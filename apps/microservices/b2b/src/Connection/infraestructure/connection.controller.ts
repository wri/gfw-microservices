import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  HttpException,
} from '@nestjs/common';
import { ConnectionUseCases } from '../application/connection.use-case';
import { FullConnectionFiltersDto } from '../application/dtos/connection-filters.dto';
import { IdNumericDto } from '../../Shared/application/dtos/id-numeric.dto';
import { ConnectionUpdateStatusHttpDto } from '../application/dtos/connection-status.dto';
import { IdStringDto } from '../../Shared/application/dtos/id-string.dto';
import { SearchDto } from '../../Shared/application/dtos/search.dto';
import {
  FilterType,
  OrderType,
  QueryCriteria,
} from '../../Shared/domain/criteria/query';
import { CreateConnectionDto } from '../application/dtos/connection.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CheckUserBelongToOrgDTO } from '../application/dtos/connection-check.dto';

@Controller('/connections')
export class ConnectionController {
  constructor(private connectionUseCases: ConnectionUseCases) {}

  @ApiOperation({
    summary:
      'Accept a connection from a invitation. The invitation must be in pending status.',
  })
  @Post('/:id/accept')
  async acceptConnection(
    @Param() { id }: IdNumericDto,
    @Body() connectionAcceptDto: ConnectionUpdateStatusHttpDto,
  ) {
    const result = await this.connectionUseCases.acceptConnection(
      id,
      connectionAcceptDto,
    );
    if (result.isSuccess) return { msg: 'Connection accepted' };
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @ApiOperation({
    summary:
      'Reject a connection invitation. The invitation must be in pending status.',
  })
  @Post('/:id/reject')
  async rejectConnection(
    @Param() { id }: IdNumericDto,
    @Body() connectionRejectDto: ConnectionUpdateStatusHttpDto,
  ) {
    const result = await this.connectionUseCases.rejectConnection(
      id,
      connectionRejectDto,
    );
    if (result.isSuccess) return { msg: 'Connection rejected' };
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @ApiOperation({
    summary:
      'Cancel a invitation sent by the organization. The invitation must be in pending status.',
  })
  @Post('/:id/cancel')
  async cancelConnection(
    @Param() { id }: IdNumericDto,
    @Body() connectionCancelDto: ConnectionUpdateStatusHttpDto,
  ) {
    const result = await this.connectionUseCases.cancelConnection(
      id,
      connectionCancelDto,
    );
    if (result.isSuccess) return { msg: 'Connection canceled' };
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @ApiOperation({
    summary: 'Get the list of invitations for a organization.',
  })
  @Get('/organization/:orgId')
  async getConnection(@Param('orgId') orgId: number) {
    const connectionsFiltersDto = new FullConnectionFiltersDto();
    connectionsFiltersDto.sourceId = orgId;
    connectionsFiltersDto.status = null;
    connectionsFiltersDto.id = null;

    const result = await this.connectionUseCases.getConnections(
      connectionsFiltersDto,
    );
    if (result.isSuccess) return result.getValue();
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @Get('search')
  async search(@Query() searchDto: SearchDto, @Param('orgId') orgId: string) {
    const { filters, orders, limit, offset } = searchDto;

    const query = new QueryCriteria(
      filters as Array<FilterType>,
      orders as Array<OrderType>,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );

    const result = await this.connectionUseCases.search(query, orgId);

    if (result.isSuccess) return result.getValue();
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  //TODO: Move this to user module
  @ApiOperation({
    summary: 'Get the list of organizations by user email.',
  })
  @Get('user/:email')
  async getUserOrganizations(@Param() { email }: IdStringDto) {
    const result = await this.connectionUseCases.getOrganizationsByUser(email);
    if (result.isSuccess) return result.getValue();
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @ApiOperation({
    summary:
      'Send a invitation to a organization, this is equals to create a new invitation.',
  })
  @Post()
  async createConnection(@Body() creationConnectionDto: CreateConnectionDto) {
    const result = await this.connectionUseCases.createConnection(
      creationConnectionDto,
    );

    if (result.isSuccess) return { msg: 'Invitation sent' };
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @ApiOperation({
    summary:
      'Resend an invitation by using the invitation id. The invitation must be in pending status.',
  })
  @Post(':id/resend')
  resendInvitation(@Param('id') invitationId: number) {
    return this.connectionUseCases.resendConnection(invitationId);
  }

  @ApiOperation({
    summary:
      'Check if a user is admin for a organization using the email and organization name.',
  })
  @Post('/check')
  async checkUserIsAdminForOrgName(@Body() body: CheckUserBelongToOrgDTO) {
    const result =
      await this.connectionUseCases.checkUserBelongsToOrgAndIsAdmin(
        body.email,
        body.organizationName,
      );
    if (result.isSuccess) {
      return result.getValue();
    }

    const error = result.getError();
    throw new HttpException(error, 404);
  }
}
