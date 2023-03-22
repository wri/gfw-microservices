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
import {
  ConnectionAcceptHttpDto,
} from '../application/dtos/connection-status.dto';

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

  @Get()
  async getConnection(@Query() connectionsFiltersDto: ConnectionFiltersDto) {
    const result = await this.connectionUseCases.getConnections(
      connectionsFiltersDto,
    );
    if (result.isSuccess) return result.getValue();
    const error = result.getError();
    throw new HttpException(error.message, error.code);
  }

  @Post()
  createConnection(@Body() connectionDto: CreateConnectionDto) {
    return this.connectionUseCases.createConnection(connectionDto);
  }

  @Delete(':id')
  deleteConnection(@Param('id') connectionId: string) {
    return this.connectionUseCases.deleteConnection(connectionId);
  }
}
