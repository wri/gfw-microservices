import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { FilterType, OrderType } from '../../../Shared/domain/criteria/query';

export class CreateSharedListDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  listId: number;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  orgTargetId: number;
}
