import { Controller, Get, Query, HttpException, Param } from '@nestjs/common';
import {
  FilterType,
  OrderType,
  QueryCriteria,
} from '../../Shared/domain/criteria/query';
import { SearchListDto } from '../application/dtos/search-list.dto';
import { ListUseCases } from '../application/list.use-case';

@Controller('organizations/:orgId/lists')
export class ListController {
  constructor(private listUseCases: ListUseCases) {}

  @Get()
  async getListByFilter(
    @Query() searchListDto: SearchListDto,
    @Param('orgId') orgId: number,
  ) {
    const { filters, orders, limit, offset } = searchListDto;
    // TODO: Review why the query param is never used
    new QueryCriteria(
      filters as Array<FilterType>,
      orders as Array<OrderType>,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );

    const listRes = await this.listUseCases.findListsByFilters({}, orgId);
    if (listRes.isSuccess) return listRes.getValue();
    const error = listRes.getError();
    throw new HttpException(error.message, error.code);
  }
}

//clientstore-OTBN5
