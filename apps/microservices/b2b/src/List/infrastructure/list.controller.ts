import { Controller, Get, Query, HttpException } from '@nestjs/common';
import { ConnectionFiltersDto } from '../../Connection/application/dtos/connection-filters.dto';
import {
  FilterType,
  OrderType,
  QueryCriteria,
} from '../../Shared/domain/criteria/query';
import { SearchListDto } from '../application/dtos/search-list.dto';
import { ListUseCases } from '../application/list.use-case';

@Controller('api/list')
export class ListController {
  constructor(private listUseCases: ListUseCases) {}

  @Get()
  async getListByFilter(@Query() searchListDto: SearchListDto) {
    const { filters, orders, limit, offset } = searchListDto;

    const query = new QueryCriteria(
      filters as Array<FilterType>,
      orders as Array<OrderType>,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );

    const listRes = await this.listUseCases.findListsByFilters({});
    if (listRes.isSuccess) return listRes.getValue();
    const error = listRes.getError();
    throw new HttpException(error.message, error.code);
  }
}

//clientstore-OTBN5
