import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Query,
  HttpException,
} from '@nestjs/common';
import { CreateConnectionDto } from '../application/dtos/connection.dto';
import { ConnectionUseCases } from '../application/connection.use-case';
import { ConnectionFiltersDto } from '../application/dtos/connection-filters.dto';
import { IdNumericDto } from '../../Shared/application/dtos/id-numeric.dto';
import { ConnectionUpdateStatusHttpDto  } from '../application/dtos/connection-status.dto';
import { IdStringDto } from '../../Shared/application/dtos/id-string.dto';

@Controller('api/connection')
export class ConnectionController {
  constructor(private connectionUseCases: ConnectionUseCases) {}

  @Post('accept/:id')
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

  @Post('reject/:id')
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

  @Post('cancel/:id')
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

  @Get()
  async getConnection(@Query() connectionsFiltersDto: ConnectionFiltersDto) {
    const result = await this.connectionUseCases.getConnections(
      connectionsFiltersDto,
    );
    if (result.isSuccess) return result.getValue();
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @Get('user/:id')
  async getUserOrganizations(@Param() { id }: IdStringDto) {
    const result = await this.connectionUseCases.getOrganizationsByUser(id);
    if (result.isSuccess) return result.getValue();
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @Post()
  async createConnection(@Body() creationConnectionDto: CreateConnectionDto) {
    const result = await this.connectionUseCases.createConnection(
      creationConnectionDto,
    );

    if (result.isSuccess) return { msg: 'Invitation sent' };
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @Post(':id')
  resendInvitation(@Param('id') invitationId: number) {
    return this.connectionUseCases.resendConnection(invitationId);
  }
}
