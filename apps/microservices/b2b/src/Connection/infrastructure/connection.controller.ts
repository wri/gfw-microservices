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
import { ConnectionAcceptHttpDto, ConnectionRejectHttpDto } from '../application/dtos/connection-status.dto';
import { IdStringDto } from '../../Shared/application/dtos/id-string.dto';

@Controller('api/connection')
export class ConnectionController {
  constructor(private connectionUseCases: ConnectionUseCases) {}

  @Post('accept/:id')
  async acceptConnection(
    @Param() { id }: IdNumericDto,
    @Body() connectionAcceptDto: ConnectionAcceptHttpDto,
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
    @Body() connectionrejectDto: ConnectionRejectHttpDto,
  ) {
    const result = await this.connectionUseCases.rejectConnection(
      id,
      connectionrejectDto,
    );
    if (result.isSuccess) return { msg: 'Connection rejected' };
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
}
