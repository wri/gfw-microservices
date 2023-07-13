import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ConnectionStatus } from '../../domain/connection';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FullConnectionFiltersDto {
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ConnectionStatus)
  status: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  sourceId: number;
}

export class ConnectionFiltersDto extends PartialType(
  FullConnectionFiltersDto,
) {}
