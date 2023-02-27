import {
  IsString,
  IsNotEmpty,
  IsArray,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class ConnectionMembersDto {
  @IsString()
  @IsNotEmpty()
  memeberName: string;

  @IsString()
  @IsNotEmpty()
  listId: string;
}

export class CreateConnectionDto {
  @IsString()
  @IsNotEmpty()
  connectionName: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ConnectionMembersDto)
  @MinLength(2)
  connectionList: ConnectionMembersDto[];
}

export class UpdateConnectionDto extends PartialType(CreateConnectionDto) {}
