import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SearchDto } from '../../Shared/application/dtos/search.dto';
import {
  FilterType,
  OrderType,
  QueryCriteria,
} from '../../Shared/domain/criteria/query';
import { SearchResult } from '../../Shared/domain/types';
import { CreateSharedListDto } from '../application/dtos/create-shared-list.dto';
import { SharedListUseCases } from '../application/shared-list.use-case';
import { SharedList } from '../domain/shared-list.entity';

@Controller('organizations/:orgId/shared-lists')
export class SharedListController {
  constructor(private readonly sharedListUseCases: SharedListUseCases) {}

  @Post()
  async createSharedList(
    @Param('orgId') orgId: number,
    @Body() query: CreateSharedListDto,
  ): Promise<SharedList | undefined> {
    const res = await this.sharedListUseCases.createSharedList(orgId, query);
    if (res.isSuccess) return res.getValue();
    const error = res.getError();
    throw new HttpException(error.message, error.code);
  }

  @Get('/search')
  async search(
    @Query() searchDto: SearchDto,
  ): Promise<SearchResult<SharedList>> {
    const { filters, orders, limit, offset } = searchDto;

    const query = new QueryCriteria(
      filters as Array<FilterType>,
      orders as Array<OrderType>,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
    const res = await this.sharedListUseCases.search(query);
    if (res.isSuccess) return res.getValue();
    const error = res.getError();
    throw new HttpException(error.message, error.code);
  }
}
