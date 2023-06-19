import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { FilterType, OrderType } from '../../../Shared/domain/criteria/query';

export class SearchListDto {
  @IsOptional()
  @IsArray()
  filters: Array<FilterType>;

  @IsOptional()
  @IsArray()
  orders: Array<OrderType>;

  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsNumber()
  offset: number;
}
