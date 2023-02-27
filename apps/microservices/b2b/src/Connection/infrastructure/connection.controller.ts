import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CreateConnectionDto } from 'src/Connection/application/dtos/connection.dto';
import { ConnectionUseCases } from 'src/Connection/application/connection.use-case';

@Controller('api/connection')
export class ConnectionController {
  constructor(private connectionUseCases: ConnectionUseCases) {}

  @Get(':id')
  async acceptConnection(@Param('id') id: any) {
    return this.connectionUseCases.acceptConnection(id);
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
