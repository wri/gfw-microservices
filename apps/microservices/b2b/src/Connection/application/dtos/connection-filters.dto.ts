import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ConnectionStatus } from '../../domain/connection';

export class FullConnectionFiltersDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsOptional()
  @IsEnum(ConnectionStatus)
  status: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  targetId: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  sourceId: number;
}

export class ConnectionFiltersDto extends PartialType(
  FullConnectionFiltersDto,
) {}
