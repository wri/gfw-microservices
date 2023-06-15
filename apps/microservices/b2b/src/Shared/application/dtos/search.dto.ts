import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { FilterType, OrderType } from '../../../Shared/domain/criteria/query';

export class SearchDto {
  @IsOptional()
  @IsArray()
  filters: Array<FilterType>;

  @IsOptional()
  @IsArray()
  orders: Array<OrderType>;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  limit: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  offset: number;
}
