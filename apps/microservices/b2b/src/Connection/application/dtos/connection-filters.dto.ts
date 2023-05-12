import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ConnectionStatus } from '../../domain/connection';

export class ConnectionFiltersDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: Number;

  @IsOptional()
  @IsEnum(ConnectionStatus)
  status: String;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  sourceId: Number;
}
