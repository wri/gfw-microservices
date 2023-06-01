import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { CreateSharedListDto } from '../application/dtos/create-shared-list.dto';
import { SharedListUseCases } from '../application/shared-list.use-case';
import { SharedList } from '../domain/shared-list.entity';

@Controller('api/organizations/:orgId/shared-lists')
export class SharedListController {
  constructor(private readonly sharedListUseCases: SharedListUseCases) {}

  @Post()
  async createSharedList(@Param('orgId') orgId: number, @Body() query: CreateSharedListDto): Promise<SharedList | undefined> {
    const res = await this.sharedListUseCases.createSharedList(orgId, query);
    if (res.isSuccess) return res.getValue();
    const error = res.getError();
    throw new HttpException(error.message, error.code);
  }
}
